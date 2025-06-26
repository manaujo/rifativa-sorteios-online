
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      // Criar registro do pagamento
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Complete seus dados e realize o pagamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              type="text"
              value={compradorInfo.nome}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              value={compradorInfo.cpf}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, cpf: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="text"
              value={compradorInfo.telefone}
              onChange={(e) => setCompradorInfo(prev => ({ ...prev, telefone: e.target.value }))}
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resumo do Pagamento</h4>
            <div className="text-sm space-y-1">
              <p><strong>{tituloItem}</strong></p>
              <p>Quantidade: {quantidade}</p>
              <p>Valor unitário: R$ {(valor / 100).toFixed(2)}</p>
              <p className="text-lg font-bold">Total: R$ {(valorTotal / 100).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Chave PIX:</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyPixKey}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-sm bg-white p-2 rounded border break-all">
              {chavePix}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
            <p className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600" />
              Após realizar o pagamento, seus bilhetes serão confirmados automaticamente.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Processando..." : "Confirmar Dados"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PixPaymentModal;
