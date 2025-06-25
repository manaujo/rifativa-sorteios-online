
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Share2, Target, ShoppingCart, Users, Trophy, Gift } from "lucide-react";
import Header from "@/components/Header";
import RankingCompradores from "@/components/campanhas/RankingCompradores";
import CheckoutButton from "@/components/checkout/CheckoutButton";

interface Comprador {
  nome_comprador: string;
  total_bilhetes: number;
  total_gasto: number;
}

const CampanhaDetalhes = () => {
  const { id } = useParams();
  const { toast } = useToast();
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
          users!inner(nome, chave_pix),
          bilhetes_campanha(quantidade, status, nome_comprador)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Query para ranking de compradores
  const { data: ranking } = useQuery({
    queryKey: ["campanha-ranking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bilhetes_campanha")
        .select("nome_comprador, quantidade")
        .eq("campanha_id", id)
        .eq("status", "pago");
      
      if (error) throw error;
      
      // Agrupa por comprador com tipagem correta
      const grouped: Record<string, Comprador> = data.reduce((acc, bilhete) => {
        const nome = bilhete.nome_comprador;
        if (!acc[nome]) {
          acc[nome] = { 
            nome_comprador: nome, 
            total_bilhetes: 0,
            total_gasto: 0
          };
        }
        acc[nome].total_bilhetes += bilhete.quantidade;
        return acc;
      }, {} as Record<string, Comprador>);

      return Object.values(grouped).sort((a, b) => b.total_bilhetes - a.total_bilhetes);
    },
    enabled: !!id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando campanha...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-600">Campanha não encontrada</h2>
          </div>
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
          <Link to="/campanhas" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para campanhas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Informações da Campanha */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      <Target className="w-3 h-3 mr-1" />
                      {campanha.modo === 'simples' ? 'Modo Simples' : 'Modo Combo'}
                    </Badge>
                    {campanha.destaque && (
                      <Badge className="bg-yellow-500 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
                
                <CardTitle className="text-3xl mb-2">{campanha.titulo}</CardTitle>
                <p className="text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Criado por: {campanha.users?.nome}
                </p>
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

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      Sobre a Campanha
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{campanha.descricao}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary-600">
                        R$ {Number(campanha.preco_bilhete).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">por bilhete</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {totalBilhetes}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">bilhetes vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-700">
                        R$ {totalArrecadado.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">arrecadado</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Como funciona:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                      <div className="space-y-2">
                        <p className="text-sm">• Bilhetes ilimitados disponíveis</p>
                        <p className="text-sm">• Cada bilhete = uma chance de concorrer</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">• Quanto mais bilhetes, maiores suas chances</p>
                        <p className="text-sm">• Você apoia uma causa importante</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking de Compradores */}
            <RankingCompradores 
              compradores={ranking || []} 
              precoBilhete={Number(campanha.preco_bilhete)}
            />
          </div>

          {/* Formulário de Compra */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
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
                      className="text-center font-bold text-lg"
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

                  <div className="border-t pt-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Quantidade:</span>
                        <span className="font-bold">{quantidade} bilhetes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Valor total:</span>
                        <span className="text-xl font-bold text-primary-600">
                          R$ {valorTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <CheckoutButton
                      valor={valorTotal}
                      quantidade={quantidade}
                      tipo="campanha"
                      itemId={id!}
                      compradorInfo={compradorInfo}
                      disabled={quantidade < 1}
                      className="w-full bg-gradient-primary hover:opacity-90 h-12 text-lg"
                    >
                      Comprar Bilhetes
                    </CheckoutButton>
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
