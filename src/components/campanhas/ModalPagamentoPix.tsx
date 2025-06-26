
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onPagamentoConfirmado 
}: ModalPagamentoPixProps) => {
  const { toast } = useToast();
  const [compradorInfo, setCompradorInfo] = useState({
    nome: "",
    cpf: "",
    telefone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valorTotal = valor * quantidade;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("pagamentos").insert({
        tipo: "campanha",
        referencia_id: campanhaId,
        valor: valorTotal,
        comprador_nome: compradorInfo.nome,
        comprador_cpf: compradorInfo.cpf,
        comprador_telefone: compradorInfo.telefone,
        status: "pendente",
        metodo: "pix"
      });

      if (error) throw error;

      toast({
        title: "Pagamento PIX gerado!",
        description: "Realize o pagamento via PIX e aguarde a confirmação.",
      });

      onPagamentoConfirmado();
      onClose();
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o pagamento PIX.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Pagamento PIX</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">{campanhaTitulo}</h3>
            <div className="space-y-1">
              <p className="text-xs text-blue-700">Quantidade: {quantidade} bilhetes</p>
              <p className="text-lg font-bold text-blue-900">R$ {(valorTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              value={compradorInfo.nome}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-sm">CPF</Label>
            <Input
              id="cpf"
              type="text"
              value={compradorInfo.cpf}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, cpf: e.target.value }))}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone" className="text-sm">Telefone</Label>
            <Input
              id="telefone"
              type="text"
              value={compradorInfo.telefone}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, telefone: e.target.value }))}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 block">
              Chave PIX:
            </Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-gray-100 rounded border text-xs font-mono break-all">
                {chavePix}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(chavePix)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-600">
              QR Code seria gerado aqui
            </p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Como pagar:</strong>
            </p>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>1. Copie a chave PIX acima</li>
              <li>2. Abra seu app bancário</li>
              <li>3. Faça a transferência PIX</li>
              <li>4. Confirme o pagamento abaixo</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 h-10">
              {isSubmitting ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPagamentoPix;
