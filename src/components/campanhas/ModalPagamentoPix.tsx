
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModalPagamentoPixProps {
  isOpen: boolean;
  onClose: () => void;
  chavePix: string;
  valor: number;
  quantidade: number;
  campanhaTitulo: string;
  onPagamentoConfirmado: () => void;
}

const ModalPagamentoPix = ({ 
  isOpen, 
  onClose, 
  chavePix, 
  valor, 
  quantidade, 
  campanhaTitulo,
  onPagamentoConfirmado 
}: ModalPagamentoPixProps) => {
  const { toast } = useToast();
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência.",
    });
  };

  const confirmarPagamento = () => {
    setPagamentoConfirmado(true);
    setTimeout(() => {
      onPagamentoConfirmado();
      onClose();
      setPagamentoConfirmado(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Pagamento PIX</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2">{campanhaTitulo}</h3>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">Quantidade: {quantidade} bilhetes</p>
              <p className="text-2xl font-bold text-blue-900">R$ {valor.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Chave PIX:
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-100 rounded border text-sm font-mono">
                  {chavePix}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(chavePix)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                QR Code seria gerado aqui
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Como pagar:</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>1. Copie a chave PIX acima</li>
              <li>2. Abra seu app bancário</li>
              <li>3. Faça a transferência PIX</li>
              <li>4. Confirme o pagamento abaixo</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={confirmarPagamento}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={pagamentoConfirmado}
            >
              {pagamentoConfirmado ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmado!
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
