
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Trophy, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import GridNumerosRifa from "@/components/rifas/GridNumerosRifa";
import PixPaymentModal from "@/components/rifas/PixPaymentModal";

const RifaDetalhes = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);
  const [showPixModal, setShowPixModal] = useState(false);
  const [compradorInfo, setCompradorInfo] = useState({
    nome: "",
    cpf: "",
    telefone: ""
  });

  const { data: rifa, isLoading } = useQuery({
    queryKey: ["rifa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rifas")
        .select(`
          *,
          users!inner(nome, chave_pix),
          bilhetes_rifa(numero, status, nome_comprador, is_ganhador)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Rifa: ${rifa?.titulo}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Link da rifa copiado para a área de transferência.",
      });
    }
  };

  const handleComprar = () => {
    if (numerosSelecionados.length === 0) {
      toast({
        title: "Selecione os números",
        description: "Escolha pelo menos um número para participar da rifa.",
        variant: "destructive"
      });
      return;
    }

    if (!compradorInfo.nome || !compradorInfo.cpf || !compradorInfo.telefone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setShowPixModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando rifa...</div>
        </div>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Rifa não encontrada</h1>
            <Link to="/rifas">
              <Button>Ver outras rifas</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bilhetesVendidos = rifa.bilhetes_rifa?.filter(
    (b: any) => b.status === "confirmado"
  ).length || 0;
  const porcentagemVendida = (bilhetesVendidos / rifa.quantidade_bilhetes) * 100;
  const valorTotal = numerosSelecionados.length * Number(rifa.valor_bilhete);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/rifas" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para rifas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detalhes da Rifa */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Trophy className="w-3 h-3 mr-1" />
                    {rifa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
                
                <CardTitle className="text-3xl">{rifa.titulo}</CardTitle>
                <CardDescription className="text-lg">
                  Por: {rifa.users?.nome}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {rifa.imagem && (
                  <div className="aspect-video overflow-hidden rounded-lg mb-6">
                    <img
                      src={rifa.imagem}
                      alt={rifa.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{rifa.descricao}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        R$ {Number(rifa.valor_bilhete).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Por bilhete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {rifa.quantidade_bilhetes}
                      </div>
                      <div className="text-sm text-gray-600">Total de bilhetes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {bilhetesVendidos}
                      </div>
                      <div className="text-sm text-gray-600">Vendidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {porcentagemVendida.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Progresso</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <GridNumerosRifa
              bilhetes={rifa.bilhetes_rifa || []}
              onNumeroSelect={setNumerosSelecionados}
              rifaEncerrada={rifa.status !== 'ativa'}
              numeroGanhador={rifa.bilhete_premiado}
            />
          </div>

          {/* Formulário de Compra */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Participar da Rifa</CardTitle>
                <CardDescription>
                  Preencha seus dados e escolha os números
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={compradorInfo.nome}
                    onChange={(e) => setCompradorInfo(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={compradorInfo.cpf}
                    onChange={(e) => setCompradorInfo(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="text"
                    value={compradorInfo.telefone}
                    onChange={(e) => setCompradorInfo(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {numerosSelecionados.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Resumo da Compra</h4>
                    <div className="text-sm space-y-1">
                      <p>Números: {numerosSelecionados.sort((a, b) => a - b).join(", ")}</p>
                      <p>Quantidade: {numerosSelecionados.length} bilhete(s)</p>
                      <p>Valor unitário: R$ {Number(rifa.valor_bilhete).toFixed(2)}</p>
                      <p className="text-lg font-bold">Total: R$ {valorTotal.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleComprar}
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={rifa.status !== 'ativa'}
                >
                  {rifa.status === 'ativa' ? 'Comprar via PIX' : 'Rifa Encerrada'}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  🔒 Pagamento seguro via PIX
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        valor={Math.round(Number(rifa.valor_bilhete) * 100)}
        numerosSelecionados={numerosSelecionados}
        rifaId={rifa.id}
        chavePix={rifa.users?.chave_pix || ""}
        tituloRifa={rifa.titulo}
        compradorInfo={compradorInfo}
      />
    </div>
  );
};

export default RifaDetalhes;
