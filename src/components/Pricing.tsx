
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = [
    {
      id: "economico",
      name: "Econômico",
      price: "R$ 97,00",
      stripePrice: "price_economico_monthly", // Substitua pelos seus price IDs reais
      period: "por mês",
      popular: false,
      features: [
        "Até 2 rifas",
        "Até 2 campanhas", 
        "Até 100 mil bilhetes",
        "PIX direto para você",
        "Painel de controle",
        "Suporte por email"
      ]
    },
    {
      id: "padrao",
      name: "Padrão",
      price: "R$ 159,90",
      stripePrice: "price_padrao_monthly",
      period: "por mês",
      popular: true,
      features: [
        "Até 5 rifas",
        "Até 5 campanhas",
        "Até 500 mil bilhetes",
        "PIX direto para você",
        "Painel avançado",
        "Suporte prioritário",
        "Relatórios detalhados"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 499,00",
      stripePrice: "price_premium_monthly",
      period: "por mês",
      originalPrice: "R$ 999,90",
      popular: false,
      features: [
        "Até 10 rifas",
        "Até 10 campanhas",
        "Até 1 milhão de bilhetes",
        "Valor ilimitado por bilhete",
        "PIX direto para você",
        "Painel premium",
        "Suporte 24/7",
        "API personalizada"
      ]
    }
  ];

  const handleSubscribe = async (planId: string, stripePriceId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { 
          priceId: stripePriceId,
          planId: planId
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Uma nova aba foi aberta para o pagamento da assinatura.",
        });
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section id="planos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            💳 Nossos <span className="gradient-text">Planos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua rifa ou campanha
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 card-hover animate-fade-in ${
                plan.popular 
                  ? 'border-primary-500 ring-4 ring-primary-100 scale-105' 
                  : 'border-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-gray-400 line-through text-lg mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold gradient-text">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-600">{plan.period}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {user ? (
                <Button 
                  onClick={() => handleSubscribe(plan.id, plan.stripePrice)}
                  disabled={isLoading === plan.id}
                  className={`w-full py-3 text-lg ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:opacity-90' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {isLoading === plan.id ? 'Processando...' : `Assinar ${plan.name}`}
                </Button>
              ) : (
                <Link to="/login" className="block">
                  <Button 
                    className={`w-full py-3 text-lg ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:opacity-90' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    Fazer Login para Assinar
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            🔒 Pagamento 100% seguro • ✅ Cancele quando quiser • 🚀 Ativação imediata
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
