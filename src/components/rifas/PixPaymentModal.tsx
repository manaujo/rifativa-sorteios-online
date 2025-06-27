
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  valor: number;
  numerosSelecionados: number[];
  rifaId: string;
  chavePix: string;
  tituloRifa: string;
  compradorInfo: {
    nome: string;
    cpf: string;
    telefone: string;
  };
}

const PixPaymentModal = ({
  isOpen,
  onClose,
  valor,
  numerosSelecionados,
  rifaId,
  chavePix,
  tituloRifa,
  compradorInfo
}: PixPaymentModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const valorTotal = valor * numerosSelecionados.length;

  // Função para gerar QR Code PIX
  const generatePixQRCode = (chavePix: string, valor: number, nomeRecebedor: string, cidade: string = "Cidade") => {
    const valorFormatado = (valor / 100).toFixed(2);
    
    // Payload PIX simplificado
    const payload = `00020126580014br.gov.bcb.pix0136${chavePix}520400005303986540${valorFormatado.length}${valorFormatado}5802BR5913${nomeRecebedor}6008${cidade}62070503***6304`;
    
    // Gerar QR Code usando API pública
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Reservar os números selecionados
      const bilhetesParaInserir = numerosSelecionados.map(numero => ({
        rifa_id: rifaId,
        numero: numero,
        nome_comprador: compradorInfo.nome,
        cpf: compradorInfo.cpf,
        telefone: compradorInfo.telefone,
        status: "reservado" as const
      }));

      const { error } = await supabase.from("bilhetes_rifa").insert(bilhetesParaInserir);

      if (error) throw error;

      toast({
        title: "Números reservados!",
        description: "Seus números foram reservados. Aguarde a confirmação do criador da rifa após o pagamento.",
      });

      onClose();
    } catch (error) {
      console.error("Erro ao reservar números:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reservar os números. Alguns podem já estar ocupados.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(chavePix);
    toast({
      title: "Chave PIX copiada!",
      description: "Cole a chave no seu app de pagamentos.",
    });
  };

  const qrCodeUrl = generatePixQRCode(chavePix, valorTotal, "Rifativa", "SaoPaulo");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Complete o pagamento e confirme para reservar seus números
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">{tituloRifa}</h4>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Números escolhidos:</strong> {numerosSelecionados.sort((a, b) => a - b).join(", ")}
              </p>
              <p className="text-sm">Quantidade: {numerosSelecionados.length}</p>
              <p className="text-sm">Valor unitário: R$ {(valor / 100).toFixed(2)}</p>
              <p className="text-lg font-bold">Total: R$ {(valorTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Chave PIX:</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPixKey}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-sm bg-white p-3 rounded border break-all">
              {chavePix}
            </p>
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
            <p className="flex items-start text-sm">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
              <span>
                <strong>Instruções:</strong><br/>
                1. Faça o PIX para a chave acima<br/>
                2. Clique em "Confirmar Pagamento" após transferir<br/>
                3. Aguarde a confirmação do criador da rifa
              </span>
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;
