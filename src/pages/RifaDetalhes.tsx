
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
import { ArrowLeft, Share2, Trophy, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";

const RifaDetalhes = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [compradorInfo, setCompradorInfo] = useState({
    nome: "",
    cpf: "",
    telefone: "",
  });

  const { data: rifa, isLoading } = useQuery({
    queryKey: ["rifa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rifas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_rifa(numero, status)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const reservarBilhetesMutation = useMutation({
    mutationFn: async () => {
      const bilhetes = selectedNumbers.map(numero => ({
        rifa_id: id,
        numero,
        nome_comprador: compradorInfo.nome,
        cpf: compradorInfo.cpf,
        telefone: compradorInfo.telefone,
        status: 'reservado'
      }));

      const { error } = await supabase
        .from("bilhetes_rifa")
        .insert(bilhetes);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Bilhetes reservados!",
        description: "Seus bilhetes foram reservados com sucesso. Efetue o pagamento para confirmá-los.",
      });
      queryClient.invalidateQueries({ queryKey: ["rifa", id] });
      setSelectedNumbers([]);
      setCompradorInfo({ nome: "", cpf: "", telefone: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reservar bilhetes",
        description: error.message,
        variant: "destructive"
      });
    }
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

  const toggleNumber = (numero: number) => {
    if (selectedNumbers.includes(numero)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== numero));
    } else {
      setSelectedNumbers([...selectedNumbers, numero]);
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

    if (selectedNumbers.length === 0) {
      toast({
        title: "Nenhum número selecionado",
        description: "Selecione pelo menos um número para continuar.",
        variant: "destructive"
      });
      return;
    }

    reservarBilhetesMutation.mutate();
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
          <div className="text-center">Rifa não encontrada</div>
        </div>
      </div>
    );
  }

  const bilhetesOcupados = rifa.bilhetes_rifa?.map((b: any) => b.numero) || [];
  const bilhetesDisponiveis = Array.from(
    { length: rifa.quantidade_bilhetes }, 
    (_, i) => i + 1
  ).filter(num => !bilhetesOcupados.includes(num));

  const totalSelecionado = selectedNumbers.length * Number(rifa.valor_bilhete);

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
          {/* Informações da Rifa */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">
                    <Trophy className="w-3 h-3 mr-1" />
                    Ativa
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
                
                <CardTitle className="text-2xl">{rifa.titulo}</CardTitle>
                <p className="text-gray-600">Por: {rifa.users?.nome}</p>
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
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                    <p className="text-gray-700">{rifa.descricao}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">
                        R$ {Number(rifa.valor_bilhete).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">por bilhete</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{rifa.quantidade_bilhetes}</p>
                      <p className="text-sm text-gray-600">total de bilhetes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {bilhetesOcupados.length}
                      </p>
                      <p className="text-sm text-gray-600">vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {bilhetesDisponiveis.length}
                      </p>
                      <p className="text-sm text-gray-600">disponíveis</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seleção de Números */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Escolha seus números</CardTitle>
                <p className="text-sm text-gray-600">
                  Clique nos números para selecioná-los. Números em cinza já foram vendidos.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: rifa.quantidade_bilhetes }, (_, i) => i + 1).map(numero => {
                    const isOcupado = bilhetesOcupados.includes(numero);
                    const isSelecionado = selectedNumbers.includes(numero);
                    
                    return (
                      <Button
                        key={numero}
                        variant={isSelecionado ? "default" : "outline"}
                        size="sm"
                        disabled={isOcupado}
                        onClick={() => toggleNumber(numero)}
                        className={`
                          h-10 w-full ${
                            isOcupado 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : isSelecionado 
                                ? 'bg-primary-600 text-white' 
                                : 'hover:bg-primary-50'
                          }
                        `}
                      >
                        {String(numero).padStart(2, '0')}
                      </Button>
                    );
                  })}
                </div>

                {selectedNumbers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Números selecionados:</strong> {selectedNumbers.sort((a, b) => a - b).join(', ')}
                    </p>
                    <p className="text-lg font-bold text-blue-800 mt-1">
                      Total: R$ {totalSelecionado.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Compra */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Finalizar Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                      <span>Bilhetes selecionados:</span>
                      <span className="font-bold">{selectedNumbers.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span>Valor total:</span>
                      <span className="text-xl font-bold text-primary-600">
                        R$ {totalSelecionado.toFixed(2)}
                      </span>
                    </div>

                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={handleCompra}
                      disabled={reservarBilhetesMutation.isPending || selectedNumbers.length === 0}
                    >
                      {reservarBilhetesMutation.isPending ? "Processando..." : "Reservar Bilhetes"}
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

export default RifaDetalhes;
