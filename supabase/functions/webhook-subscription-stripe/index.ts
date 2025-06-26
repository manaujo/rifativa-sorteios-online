
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-SUBSCRIPTION-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook started");

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
    
    logStep('Webhook recebido', { type: event.type });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle subscription events
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.updated") {
      
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      logStep('Processando assinatura', { 
        subscriptionId: subscription.id, 
        customerId,
        status: subscription.status 
      });

      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error("Cliente não encontrado");
      }

      const customerEmail = (customer as Stripe.Customer).email;
      if (!customerEmail) {
        throw new Error("Email do cliente não encontrado");
      }

      // Determine plan based on price
      let plano = "economico";
      const priceId = subscription.items.data[0].price.id;
      
      if (priceId === "price_1QZyWmIZKCJ93bfRu4mNMTPO") { // Padrão
        plano = "padrao";
      } else if (priceId === "price_1QZyXBIZKCJ93bfRYhzO2zLB") { // Premium
        plano = "premium";
      }

      logStep('Determinado plano', { priceId, plano });

      // Update user plan
      const { error } = await supabase
        .from("users")
        .update({ 
          plano: plano as any
        })
        .eq("email", customerEmail);

      if (error) {
        logStep('Erro ao atualizar plano', { error: error.message });
        throw error;
      }

      logStep('Plano atualizado com sucesso', { email: customerEmail, plano });

    } else if (event.type === "customer.subscription.deleted") {
      
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      logStep('Processando cancelamento de assinatura', { 
        subscriptionId: subscription.id, 
        customerId 
      });

      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error("Cliente não encontrado");
      }

      const customerEmail = (customer as Stripe.Customer).email;
      if (!customerEmail) {
        throw new Error("Email do cliente não encontrado");
      }

      // Downgrade to economico plan
      const { error } = await supabase
        .from("users")
        .update({ 
          plano: "economico" as any
        })
        .eq("email", customerEmail);

      if (error) {
        logStep('Erro ao fazer downgrade', { error: error.message });
        throw error;
      }

      logStep('Downgrade realizado com sucesso', { email: customerEmail });
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    logStep('Erro no webhook', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
