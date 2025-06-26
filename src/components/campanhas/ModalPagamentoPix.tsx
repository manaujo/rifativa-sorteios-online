
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ModalPagamentoPixProps {
  isOpen: boolean;
  onClose: () => void;
  chavePix: string;
  valor: number;
  quantidade: number;
  campanhaTitulo: string;
  campanhaId: string;
  compradorInfo: {
    nome: string;
    cpf: string;
    telefone: string;
  };
  onPagamentoConfirmado: () => void;
}

const ModalPagamentoPix = ({ 
  isOpen, 
  onClose, 
  chavePix, 
  valor, 
  quantidade, 
  campanhaTitulo,
  campanhaId,
  compradorInfo,
  onPagamentoConfirmado 
}: ModalPagamentoPixProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valorTotal = valor * quantidade;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência.",
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Criar bilhete de campanha com status "aguardando"
      const { error } = await supabase.from("bilhetes_campanha").insert({
        campanha_id: campanhaId,
        quantidade: quantidade,
        nome_comprador: compradorInfo.nome,
        cpf: compradorInfo.cpf,
        telefone: compradorInfo.telefone,
        status: "aguardando",
        valor_pago: valorTotal
      });

      if (error) throw error;

      onPagamentoConfirmado();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar compra:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a compra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Pagamento PIX</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">{campanhaTitulo}</h3>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">Quantidade: {quantidade} bilhetes</p>
              <p className="text-2xl font-bold text-blue-900">R$ {(valorTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Chave PIX:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(chavePix)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-white rounded border text-sm font-mono break-all">
              {chavePix}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              QR Code seria gerado aqui
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-2">Como pagar:</p>
                <ol className="text-yellow-700 space-y-1">
                  <li>1. Copie a chave PIX acima</li>
                  <li>2. Abra seu app bancário</li>
                  <li>3. Faça a transferência PIX</li>
                  <li>4. Confirme abaixo após o pagamento</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>⚠️ Importante:</strong> Após realizar o pagamento, clique em "Confirmar Pagamento" 
              para reservar seus bilhetes. O criador da campanha confirmará sua compra após verificar 
              o recebimento.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPagamentoPix;
