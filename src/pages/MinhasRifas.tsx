
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
import { ArrowLeft, Edit, Trash2, Share2, Trophy, Eye, Users } from "lucide-react";
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

  const handleShare = (rifaId: string, titulo: string) => {
    const url = `${window.location.origin}/rifa/${rifaId}`;
    if (navigator.share) {
      navigator.share({
        title: `Rifa: ${titulo}`,
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

  if (loading || rifasLoading) {
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Minhas Rifas</h1>
          <p className="text-gray-600">Gerencie suas rifas criadas</p>
        </div>

        <div className="grid gap-6">
          {rifas?.map((rifa) => {
            const bilhetesVendidos = rifa.bilhetes_rifa?.filter(
              (b: any) => b.status === "confirmado"
            ) || [];
            const bilhetesReservados = rifa.bilhetes_rifa?.filter(
              (b: any) => b.status === "reservado"
            ) || [];
            const totalArrecadado = bilhetesVendidos.length * Number(rifa.valor_bilhete);
            const porcentagemVendida = (bilhetesVendidos.length / rifa.quantidade_bilhetes) * 100;

            return (
              <Card key={rifa.id} className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Imagem */}
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

                  {/* Informações */}
                  <div className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={rifa.status === 'ativa' ? 'default' : 'secondary'}>
                        {rifa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(rifa.id, rifa.titulo)}
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

                    {/* Barra de progresso */}
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

                  {/* Estatísticas */}
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
                        <span className="text-sm text-gray-600">Reservados:</span>
                        <span className="font-semibold text-yellow-600">
                          {bilhetesReservados.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Disponíveis:</span>
                        <span className="font-semibold text-blue-600">
                          {rifa.quantidade_bilhetes - rifa.bilhetes_rifa?.length}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total possível:</span>
                          <span className="font-semibold">
                            R$ {(rifa.quantidade_bilhetes * Number(rifa.valor_bilhete)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {bilhetesVendidos.length > 0 && (
                      <div className="mt-4">
                        <Tabs defaultValue="compradores" className="w-full">
                          <TabsList className="grid w-full grid-cols-1">
                            <TabsTrigger value="compradores">Compradores</TabsTrigger>
                          </TabsList>
                          <TabsContent value="compradores" className="mt-4">
                            <div className="max-h-40 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Nº</TableHead>
                                    <TableHead className="text-xs">Nome</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {bilhetesVendidos.slice(0, 5).map((bilhete: any) => (
                                    <TableRow key={bilhete.id}>
                                      <TableCell className="text-xs">{bilhete.numero}</TableCell>
                                      <TableCell className="text-xs">{bilhete.nome_comprador}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {bilhetesVendidos.length > 5 && (
                                <p className="text-xs text-gray-500 text-center mt-2">
                                  +{bilhetesVendidos.length - 5} compradores...
                                </p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {rifas && rifas.length === 0 && (
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
      </div>
    </div>
  );
};

export default MinhasRifas;
