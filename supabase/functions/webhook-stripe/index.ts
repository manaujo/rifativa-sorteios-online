
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Configuração do Stripe incompleta");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    
    console.log('Webhook recebido:', event.type);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        console.log('Sessão sem metadata, ignorando');
        return new Response("OK", { status: 200 });
      }

      const { tipo, item_id, quantidade, comprador_nome, comprador_cpf, comprador_telefone } = metadata;

      console.log('Processando pagamento:', { tipo, item_id, quantidade });

      if (tipo === "rifa") {
        // Para rifas, precisamos gerar números específicos
        const quantidadeNum = parseInt(quantidade);
        
        for (let i = 0; i < quantidadeNum; i++) {
          // Buscar próximo número disponível
          const { data: numeroDisponivel } = await supabase
            .from("bilhetes_rifa")
            .select("numero")
            .eq("rifa_id", item_id)
            .order("numero", { ascending: true });

          let proximoNumero = 1;
          if (numeroDisponivel && numeroDisponivel.length > 0) {
            const numerosOcupados = numeroDisponivel.map(b => b.numero);
            for (let num = 1; num <= 99999; num++) {
              if (!numerosOcupados.includes(num)) {
                proximoNumero = num;
                break;
              }
            }
          }

          // Inserir bilhete
          const { error } = await supabase
            .from("bilhetes_rifa")
            .insert({
              rifa_id: item_id,
              numero: proximoNumero,
              nome_comprador: comprador_nome,
              cpf: comprador_cpf,
              telefone: comprador_telefone,
              status: "confirmado"
            });

          if (error) {
            console.error('Erro ao inserir bilhete de rifa:', error);
            throw error;
          }
        }

      } else if (tipo === "campanha") {
        // Para campanhas, inserir uma única entrada com a quantidade
        const { error } = await supabase
          .from("bilhetes_campanha")
          .insert({
            campanha_id: item_id,
            nome_comprador: comprador_nome,
            cpf: comprador_cpf,
            telefone: comprador_telefone,
            quantidade: parseInt(quantidade),
            status: "pago"
          });

        if (error) {
          console.error('Erro ao inserir bilhete de campanha:', error);
          throw error;
        }
      }

      console.log('Pagamento processado com sucesso');
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
