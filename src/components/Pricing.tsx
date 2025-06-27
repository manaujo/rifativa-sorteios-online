
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "economico",
      name: "Econômico",
      price: "R$ 29,90",
      description: "Ideal para quem está começando",
      features: [
        "Até 2 rifas",
        "Até 2 campanhas", 
        "Até 100 mil bilhetes",
        "Suporte por email",
        "Painel básico"
      ],
      popular: false,
      color: "border-blue-200"
    },
    {
      id: "padrao",
      name: "Padrão",
      price: "R$ 59,90",
      description: "Para quem quer crescer",
      features: [
        "Até 5 rifas",
        "Até 5 campanhas",
        "Até 500 mil bilhetes",
        "Suporte prioritário",
        "Painel avançado",
        "Relatórios detalhados"
      ],
      popular: true,
      color: "border-green-200"
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 99,90",
      description: "Para profissionais",
      features: [
        "Até 10 rifas",
        "Até 10 campanhas",
        "Até 1 milhão de bilhetes",
        "Suporte 24/7",
        "Painel premium",
        "API personalizada",
        "Integração WhatsApp"
      ],
      popular: false,
      color: "border-purple-200"
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano.",
        variant: "destructive"
      });
      return;
    }

    setLoadingPlan(planId);

    try {
      console.log("Criando checkout para plano:", planId);
      
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          priceId: `dynamic_${planId}`, // Usando ID dinâmico já que criamos o price na função
          planId: planId
        }
      });

      if (error) {
        console.error("Erro na função:", error);
        throw error;
      }

      console.log("Resposta da função:", data);

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando para checkout",
          description: "Uma nova aba foi aberta para o pagamento.",
        });
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error: any) {
      console.error('Erro completo ao criar checkout:', error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="planos" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Escolha seu Plano
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece hoje mesmo a criar suas rifas e campanhas com nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative hover:shadow-xl transition-all duration-300 ${plan.color} ${
                plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-6 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                  {plan.id === 'economico' && <Zap className="w-12 h-12 text-blue-500" />}
                  {plan.id === 'padrao' && <Crown className="w-12 h-12 text-green-500" />}
                  {plan.id === 'premium' && <Star className="w-12 h-12 text-purple-500" />}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold gradient-text">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:opacity-90' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    `Escolher ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Todos os planos incluem suporte técnico e atualizações gratuitas
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cancele a qualquer momento • Sem taxa de setup • Pagamento seguro
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
