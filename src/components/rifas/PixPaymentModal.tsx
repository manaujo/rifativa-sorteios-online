
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  quantidade: number;
  tipo: "rifa" | "campanha";
  itemId: string;
  chavePix: string;
  tituloItem: string;
}

const PixPaymentModal = ({
  isOpen,
  onClose,
  valor,
  quantidade,
  tipo,
  itemId,
  chavePix,
  tituloItem
}: PixPaymentModalProps) => {
  const [compradorInfo, setCompradorInfo] = useState({
    nome: "",
    cpf: "",
    telefone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const valorTotal = valor * quantidade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("pagamentos").insert({
        tipo: tipo,
        referencia_id: itemId,
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

  const copyPixKey = () => {
    navigator.clipboard.writeText(chavePix);
    toast({
      title: "Chave PIX copiada!",
      description: "Cole a chave no seu app de pagamentos.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Complete seus dados e realize o pagamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
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

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Resumo do Pagamento</h4>
            <div className="text-xs space-y-1">
              <p><strong>{tituloItem}</strong></p>
              <p>Quantidade: {quantidade}</p>
              <p>Valor unitário: R$ {(valor / 100).toFixed(2)}</p>
              <p className="text-base font-bold">Total: R$ {(valorTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
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
            <p className="font-mono text-xs bg-white p-2 rounded border break-all">
              {chavePix}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
            <p className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
              Após realizar o pagamento, seus bilhetes serão confirmados automaticamente.
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-10">
              {isSubmitting ? "Processando..." : "Confirmar Dados"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;
