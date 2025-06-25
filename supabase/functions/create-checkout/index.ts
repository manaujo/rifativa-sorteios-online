
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { valor, quantidade, tipo, itemId, compradorInfo } = await req.json();

    console.log('Dados recebidos:', { valor, quantidade, tipo, itemId, compradorInfo });

    // Validar dados obrigatórios
    if (!valor || !quantidade || !tipo || !itemId || !compradorInfo) {
      throw new Error("Dados obrigatórios não fornecidos");
    }

    if (!compradorInfo.nome || !compradorInfo.cpf || !compradorInfo.telefone) {
      throw new Error("Dados do comprador incompletos");
    }

    // Inicializar Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Chave do Stripe não configurada");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Buscar informações do item para criar descrição
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let itemTitulo = "";
    if (tipo === "rifa") {
      const { data: rifa } = await supabase
        .from("rifas")
        .select("titulo")
        .eq("id", itemId)
        .single();
      itemTitulo = rifa?.titulo || "Rifa";
    } else if (tipo === "campanha") {
      const { data: campanha } = await supabase
        .from("campanhas")
        .select("titulo")
        .eq("id", itemId)
        .single();
      itemTitulo = campanha?.titulo || "Campanha";
    }

    // Verificar se já existe um customer com este email
    const customers = await stripe.customers.list({
      email: compradorInfo.cpf + "@checkout.local", // Usar CPF como identificador único
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Criar novo customer
      const customer = await stripe.customers.create({
        email: compradorInfo.cpf + "@checkout.local",
        name: compradorInfo.nome,
        phone: compradorInfo.telefone,
        metadata: {
          cpf: compradorInfo.cpf,
          tipo_compra: tipo,
          item_id: itemId
        }
      });
      customerId = customer.id;
    }

    console.log('Customer ID:', customerId);

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `${tipo === "rifa" ? "Bilhetes de Rifa" : "Bilhetes de Campanha"} - ${itemTitulo}`,
              description: `${quantidade} bilhete(s) para ${itemTitulo}`,
            },
            unit_amount: Math.round(valor / quantidade), // Valor por bilhete em centavos
          },
          quantity: quantidade,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/${tipo}/${itemId}`,
      metadata: {
        tipo,
        item_id: itemId,
        quantidade: quantidade.toString(),
        comprador_nome: compradorInfo.nome,
        comprador_cpf: compradorInfo.cpf,
        comprador_telefone: compradorInfo.telefone,
      },
      payment_intent_data: {
        metadata: {
          tipo,
          item_id: itemId,
          quantidade: quantidade.toString(),
          comprador_nome: compradorInfo.nome,
          comprador_cpf: compradorInfo.cpf,
          comprador_telefone: compradorInfo.telefone,
        }
      }
    });

    console.log('Sessão criada:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no create-checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
