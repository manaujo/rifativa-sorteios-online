
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Share2, Target, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";

const CampanhaDetalhes = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantidade, setQuantidade] = useState(1);
  const [compradorInfo, setCompradorInfo] = useState({
    nome: "",
    cpf: "",
    telefone: "",
  });

  const { data: campanha, isLoading } = useQuery({
    queryKey: ["campanha", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_campanha(quantidade, status)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const comprarBilhetesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("bilhetes_campanha")
        .insert({
          campanha_id: id,
          nome_comprador: compradorInfo.nome,
          cpf: compradorInfo.cpf,
          telefone: compradorInfo.telefone,
          quantidade: quantidade,
          status: 'aguardando'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Bilhetes adquiridos!",
        description: "Seus bilhetes foram registrados com sucesso. Efetue o pagamento para confirmá-los.",
      });
      queryClient.invalidateQueries({ queryKey: ["campanha", id] });
      setQuantidade(1);
      setCompradorInfo({ nome: "", cpf: "", telefone: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao comprar bilhetes",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Campanha: ${campanha?.titulo}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Link da campanha copiado para a área de transferência.",
      });
    }
  };

  const handleCompra = () => {
    if (!compradorInfo.nome || !compradorInfo.cpf || !compradorInfo.telefone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (quantidade < 1) {
      toast({
        title: "Quantidade inválida",
        description: "Selecione pelo menos 1 bilhete.",
        variant: "destructive"
      });
      return;
    }

    comprarBilhetesMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando campanha...</div>
        </div>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Campanha não encontrada</div>
        </div>
      </div>
    );
  }

  const totalBilhetes = campanha.bilhetes_campanha?.reduce(
    (acc: number, bilhete: any) => acc + bilhete.quantidade, 0
  ) || 0;
  const totalArrecadado = totalBilhetes * Number(campanha.preco_bilhete);
  const valorTotal = quantidade * Number(campanha.preco_bilhete);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/campanhas" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para campanhas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações da Campanha */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Target className="w-3 h-3 mr-1" />
                      {campanha.modo === 'simples' ? 'Simples' : 'Combo'}
                    </Badge>
                    {campanha.destaque && (
                      <Badge className="bg-yellow-500 text-white">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
                
                <CardTitle className="text-2xl">{campanha.titulo}</CardTitle>
                <p className="text-gray-600">Por: {campanha.users?.nome}</p>
              </CardHeader>

              <CardContent>
                {campanha.imagem && (
                  <div className="aspect-video overflow-hidden rounded-lg mb-6">
                    <img
                      src={campanha.imagem}
                      alt={campanha.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                    <p className="text-gray-700">{campanha.descricao}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        R$ {Number(campanha.preco_bilhete).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">por bilhete</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {totalBilhetes}
                      </p>
                      <p className="text-sm text-gray-600">bilhetes vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-700">
                        R$ {totalArrecadado.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">arrecadado</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Como funciona:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Bilhetes ilimitados - não há limite de quantidade</li>
                      <li>• Cada bilhete te dá uma chance de concorrer</li>
                      <li>• Quanto mais bilhetes, maiores suas chances</li>
                      <li>• Você está apoiando uma causa importante</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Compra */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Apoiar Campanha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade de bilhetes</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      value={compradorInfo.nome}
                      onChange={(e) => setCompradorInfo(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={compradorInfo.cpf}
                      onChange={(e) => setCompradorInfo(prev => ({...prev, cpf: e.target.value}))}
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={compradorInfo.telefone}
                      onChange={(e) => setCompradorInfo(prev => ({...prev, telefone: e.target.value}))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>Quantidade:</span>
                      <span className="font-bold">{quantidade} bilhetes</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span>Valor total:</span>
                      <span className="text-xl font-bold text-primary-600">
                        R$ {valorTotal.toFixed(2)}
                      </span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={handleCompra}
                      disabled={comprarBilhetesMutation.isPending}
                    >
                      {comprarBilhetesMutation.isPending ? "Processando..." : "Comprar Bilhetes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampanhaDetalhes;
