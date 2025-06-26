
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UpgradeButton = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    economico: { name: "Econômico", color: "bg-blue-500" },
    padrao: { name: "Padrão", color: "bg-green-500" },
    premium: { name: "Premium", color: "bg-purple-500" }
  };

  const currentPlan = profile?.plano || "economico";

  const handleUpgrade = async () => {
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <Card>
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
            <div className={`w-3 h-3 rounded-full ${plans[currentPlan as keyof typeof plans]?.color || 'bg-gray-400'}`} />
            <span className="font-semibold text-lg">
              {plans[currentPlan as keyof typeof plans]?.name || 'Plano Desconhecido'}
            </span>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativo
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? 'Carregando...' : 'Gerenciar Assinatura'}
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/#planos">
              Ver Todos os Planos
            </a>
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Recursos do seu plano:</p>
          <ul className="text-xs space-y-1">
            {currentPlan === "economico" && (
              <>
                <li>• Até 2 rifas e 2 campanhas</li>
                <li>• Até 100 mil bilhetes</li>
                <li>• Suporte por email</li>
              </>
            )}
            {currentPlan === "padrao" && (
              <>
                <li>• Até 5 rifas e 5 campanhas</li>
                <li>• Até 500 mil bilhetes</li>
                <li>• Suporte prioritário</li>
              </>
            )}
            {currentPlan === "premium" && (
              <>
                <li>• Até 10 rifas e 10 campanhas</li>
                <li>• Até 1 milhão de bilhetes</li>
                <li>• Suporte 24/7</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeButton;
