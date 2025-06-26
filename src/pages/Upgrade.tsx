
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlanValidation } from "@/hooks/usePlanValidation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Crown, Zap, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Upgrade = () => {
  const { user, profile, loading } = useAuth();
  const { rifasCount, campanhasCount, limits, currentPlan } = usePlanValidation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const plans = [
    {
      id: "economico",
      name: "Econômico",
      price: "R$ 97,00",
      stripePrice: "price_economico_monthly",
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

  const getPlanoLabel = (plano: string) => {
    switch (plano) {
      case "economico":
        return "Econômico";
      case "padrao":
        return "Padrão";
      case "premium":
        return "Premium";
      default:
        return plano;
    }
  };

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "economico":
        return "bg-blue-500";
      case "padrao":
        return "bg-green-500";
      case "premium":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSubscribe = async (planId: string, stripePriceId: string) => {
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

  const handleManageSubscription = async () => {
    setIsLoading("manage");

    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {});

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando",
          description: "Abrindo portal de gerenciamento de assinatura.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao abrir portal:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível abrir o portal de assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/perfil" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Perfil</span>
            </Link>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Rifativa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Current Plan */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-500" />
              Seu Plano Atual
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e acesse recursos premium
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getPlanoColor(currentPlan)}`} />
                <span className="font-semibold text-lg">
                  {getPlanoLabel(currentPlan)}
                </span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Ativo
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading === "manage"}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isLoading === "manage" ? 'Carregando...' : 'Gerenciar Assinatura'}
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/#planos">
                  Ver Todos os Planos
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 Recursos do seu plano:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>• {rifasCount}/{limits.rifas} rifas criadas</div>
                <div>• {campanhasCount}/{limits.campanhas} campanhas criadas</div>
                <div>• Até {limits.bilhetes.toLocaleString()} bilhetes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Faça <span className="gradient-text">Upgrade</span> do seu Plano
          </h2>
          <p className="text-gray-600">
            Desbloqueie mais recursos e crie mais rifas e campanhas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 card-hover ${
                plan.popular 
                  ? 'border-primary-500 ring-4 ring-primary-100 scale-105' 
                  : 'border-gray-200'
              } ${
                plan.id === currentPlan
                  ? 'opacity-60'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}

              {plan.id === currentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white">
                    Plano Atual
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-gray-400 line-through text-lg mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold gradient-text">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-600">{plan.period}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-success-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe(plan.id, plan.stripePrice)}
                disabled={isLoading === plan.id || plan.id === currentPlan}
                className={`w-full py-3 ${
                  plan.id === currentPlan
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.popular 
                      ? 'bg-gradient-primary hover:opacity-90' 
                      : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {plan.id === currentPlan 
                  ? 'Plano Atual'
                  : isLoading === plan.id 
                    ? 'Processando...' 
                    : `Fazer Upgrade para ${plan.name}`
                }
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            🔒 Pagamento 100% seguro • ✅ Cancele quando quiser • 🚀 Ativação imediata
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
