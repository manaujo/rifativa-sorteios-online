
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutButtonProps {
  valor: number;
  quantidade: number;
  tipo: "rifa" | "campanha";
  itemId: string;
  compradorInfo: {
    nome: string;
    cpf: string;
    telefone: string;
  };
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CheckoutButton = ({
  valor,
  quantidade,
  tipo,
  itemId,
  compradorInfo,
  disabled = false,
  className = "",
  children
}: CheckoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Validação dos dados do comprador
      if (!compradorInfo.nome || !compradorInfo.cpf || !compradorInfo.telefone) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      // Criar sessão de checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          valor: valor * 100, // Converter para centavos
          quantidade,
          tipo,
          itemId,
          compradorInfo
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Abrir checkout em nova aba
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Uma nova aba foi aberta para o pagamento.",
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
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Processando...
        </>
      ) : (
        children || (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Finalizar Compra
          </>
        )
      )}
    </Button>
  );
};

export default CheckoutButton;
