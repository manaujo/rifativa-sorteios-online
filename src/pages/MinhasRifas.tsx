import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Share2, Trophy, Eye, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MinhasRifas = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para rifas do usuário
  const { data: rifas, isLoading: rifasLoading } = useQuery({
    queryKey: ["user-rifas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rifas")
        .select(`
          *,
          bilhetes_rifa(id, status, nome_comprador, telefone, cpf, numero)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Query para campanhas do usuário
  const { data: campanhas, isLoading: campanhasLoading } = useQuery({
    queryKey: ["user-campanhas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("campanhas")
        .select(`
          *,
          bilhetes_campanha(id, status, nome_comprador, telefone, cpf, quantidade)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const excluirRifaMutation = useMutation({
    mutationFn: async (rifaId: string) => {
      const { error } = await supabase
        .from("rifas")
        .delete()
        .eq("id", rifaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rifa excluída",
        description: "A rifa foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-rifas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir rifa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const excluirCampanhaMutation = useMutation({
    mutationFn: async (campanhaId: string) => {
      const { error } = await supabase
        .from("campanhas")
        .delete()
        .eq("id", campanhaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-campanhas"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir campanha",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleShare = (id: string, titulo: string, tipo: "rifa" | "campanha") => {
    const url = `${window.location.origin}/${tipo}/${id}`;
    if (navigator.share) {
      navigator.share({
        title: `${tipo === "rifa" ? "Rifa" : "Campanha"}: ${titulo}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: `Link da ${tipo} copiado para a área de transferência.`,
      });
    }
  };

  if (loading || rifasLoading || campanhasLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Minhas Rifas e Campanhas</h1>
          <p className="text-gray-600">Gerencie suas rifas e campanhas criadas</p>
        </div>

        <Tabs defaultValue="rifas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rifas" className="flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              Rifas ({rifas?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="campanhas" className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Campanhas ({campanhas?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rifas" className="space-y-6 mt-6">
            {rifas && rifas.length > 0 ? (
              rifas.map((rifa) => {
                const bilhetesVendidos = rifa.bilhetes_rifa?.filter(
                  (b: any) => b.status === "confirmado"
                ) || [];
                const totalArrecadado = bilhetesVendidos.length * Number(rifa.valor_bilhete);
                const porcentagemVendida = (bilhetesVendidos.length / rifa.quantidade_bilhetes) * 100;

                return (
                  <Card key={rifa.id} className="overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1">
                        {rifa.imagem ? (
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={rifa.imagem}
                              alt={rifa.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant={rifa.status === 'ativa' ? 'default' : 'secondary'}>
                            {rifa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(rifa.id, rifa.titulo, "rifa")}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Link to={`/rifa/${rifa.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir rifa</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta rifa? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => excluirRifaMutation.mutate(rifa.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">{rifa.titulo}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{rifa.descricao}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor do bilhete:</span>
                            <p className="font-semibold">R$ {Number(rifa.valor_bilhete).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total de bilhetes:</span>
                            <p className="font-semibold">{rifa.quantidade_bilhetes}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Bilhetes vendidos:</span>
                            <p className="font-semibold text-green-600">{bilhetesVendidos.length}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Arrecadado:</span>
                            <p className="font-semibold text-green-700">R$ {totalArrecadado.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso de vendas</span>
                            <span>{porcentagemVendida.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-primary h-2 rounded-full transition-all"
                              style={{ width: `${porcentagemVendida}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 bg-gray-50 p-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Estatísticas
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Confirmados:</span>
                            <span className="font-semibold text-green-600">
                              {bilhetesVendidos.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Disponíveis:</span>
                            <span className="font-semibold text-blue-600">
                              {rifa.quantidade_bilhetes - rifa.bilhetes_rifa?.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma rifa criada ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Crie sua primeira rifa e comece a arrecadar!
                </p>
                <Link to="/criar-rifa">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    Criar Primeira Rifa
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="campanhas" className="space-y-6 mt-6">
            {campanhas && campanhas.length > 0 ? (
              campanhas.map((campanha) => {
                const bilhetesVendidos = campanha.bilhetes_campanha?.filter(
                  (b: any) => b.status === "pago"
                ) || [];
                const totalBilhetes = campanha.bilhetes_campanha?.reduce(
                  (acc: number, bilhete: any) => acc + bilhete.quantidade, 0
                ) || 0;
                const totalArrecadado = totalBilhetes * Number(campanha.preco_bilhete);

                return (
                  <Card key={campanha.id} className="overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-1">
                        {campanha.imagem ? (
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={campanha.imagem}
                              alt={campanha.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <Target className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              <Target className="w-3 h-3 mr-1" />
                              Campanha
                            </Badge>
                            {campanha.destaque && (
                              <Badge className="bg-yellow-500 text-white">
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(campanha.id, campanha.titulo, "campanha")}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Link to={`/campanha/${campanha.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir campanha</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => excluirCampanhaMutation.mutate(campanha.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">{campanha.titulo}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{campanha.descricao}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor do bilhete:</span>
                            <p className="font-semibold">R$ {Number(campanha.preco_bilhete).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Modo:</span>
                            <p className="font-semibold">{campanha.modo === 'simples' ? 'Simples' : 'Combo'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Bilhetes vendidos:</span>
                            <p className="font-semibold text-green-600">{totalBilhetes}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Arrecadado:</span>
                            <p className="font-semibold text-green-700">R$ {totalArrecadado.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 bg-gray-50 p-6">
                        <h4 className="font-semibold mb-4 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Estatísticas
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Compradores:</span>
                            <span className="font-semibold text-green-600">
                              {bilhetesVendidos.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total bilhetes:</span>
                            <span className="font-semibold text-blue-600">
                              {totalBilhetes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma campanha criada ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Crie sua primeira campanha e comece a arrecadar!
                </p>
                <Link to="/criar-campanha">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    Criar Primeira Campanha
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MinhasRifas;
