
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

  // Função para gerar QR Code PIX
  const generatePixQRCode = (chavePix: string, valor: number, nomeRecebedor: string, cidade: string = "Cidade") => {
    const valorFormatado = (valor / 100).toFixed(2);
    
    // Payload PIX simplificado
    const payload = `00020126580014br.gov.bcb.pix0136${chavePix}520400005303986540${valorFormatado.length}${valorFormatado}5802BR5913${nomeRecebedor}6008${cidade}62070503***6304`;
    
    // Gerar QR Code usando API pública
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência.",
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Iniciando confirmação de pagamento da campanha...");

    try {
      // Criar bilhete de campanha com status "aguardando"
      const bilheteData = {
        campanha_id: campanhaId,
        quantidade: quantidade,
        nome_comprador: compradorInfo.nome,
        cpf: compradorInfo.cpf,
        telefone: compradorInfo.telefone,
        status: "aguardando" as const,
        valor_pago: valorTotal
      };

      console.log("Inserindo bilhete de campanha:", bilheteData);

      const { data: bilheteInserido, error } = await supabase
        .from("bilhetes_campanha")
        .insert(bilheteData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir bilhete:", error);
        throw new Error("Erro ao registrar a compra. Tente novamente.");
      }

      console.log("Bilhete de campanha inserido com sucesso:", bilheteInserido);

      toast({
        title: "Compra registrada!",
        description: "Sua compra foi registrada. Aguarde a confirmação do criador da campanha.",
      });

      onPagamentoConfirmado();
      
      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar a compra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrCodeUrl = generatePixQRCode(chavePix, valorTotal, "Rifativa", "SaoPaulo");

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
            <img 
              src={qrCodeUrl} 
              alt="QR Code PIX" 
              className="w-48 h-48 mx-auto mb-2 border rounded"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                const nextElement = target.nextElementSibling as HTMLElement;
                target.style.display = 'none';
                if (nextElement) {
                  nextElement.style.display = 'block';
                }
              }}
            />
            <div style={{ display: 'none' }} className="flex flex-col items-center">
              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Erro ao gerar QR Code
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Escaneie o QR Code ou copie a chave PIX
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
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPagamentoPix;
