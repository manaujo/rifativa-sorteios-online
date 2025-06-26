
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ConfirmarPagamentos = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bilhetesRifa, isLoading: loadingRifas } = useQuery({
    queryKey: ["bilhetes-rifa-pendentes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bilhetes_rifa")
        .select(`
          id,
          numero,
          nome_comprador,
          cpf,
          telefone,
          status,
          created_at,
          rifas (
            id,
            titulo,
            user_id
          )
        `)
        .eq("status", "reservado")
        .eq("rifas.user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bilhetesCampanha, isLoading: loadingCampanhas } = useQuery({
    queryKey: ["bilhetes-campanha-pendentes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bilhetes_campanha")
        .select(`
          id,
          numero,
          quantidade,
          nome_comprador,
          cpf,
          telefone,
          status,
          created_at,
          campanhas (
            id,
            titulo,
            user_id
          )
        `)
        .eq("status", "aguardando")
        .eq("campanhas.user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const confirmarPagamentoRifa = useMutation({
    mutationFn: async (bilheteId: string) => {
      const { error } = await supabase
        .from("bilhetes_rifa")
        .update({ status: "confirmado" })
        .eq("id", bilheteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bilhetes-rifa-pendentes"] });
      toast({
        title: "Pagamento confirmado",
        description: "O bilhete foi confirmado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive"
      });
    }
  });

  const confirmarPagamentoCampanha = useMutation({
    mutationFn: async (bilheteId: string) => {
      const { error } = await supabase
        .from("bilhetes_campanha")
        .update({ status: "pago" })
        .eq("id", bilheteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bilhetes-campanha-pendentes"] });
      toast({
        title: "Pagamento confirmado",
        description: "O bilhete foi confirmado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive"
      });
    }
  });

  const rejeitarPagamento = useMutation({
    mutationFn: async ({ id, tipo }: { id: string, tipo: "rifa" | "campanha" }) => {
      if (tipo === "rifa") {
        const { error } = await supabase
          .from("bilhetes_rifa")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bilhetes_campanha")
          .update({ status: "cancelado" })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bilhetes-rifa-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["bilhetes-campanha-pendentes"] });
      toast({
        title: "Pagamento rejeitado",
        description: "O bilhete foi rejeitado e removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o pagamento.",
        variant: "destructive"
      });
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Rifativa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmar Pagamentos
          </h1>
          <p className="text-gray-600">
            Gerencie as confirmações de pagamento dos seus bilhetes vendidos
          </p>
        </div>

        {/* Rifas Pendentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-amber-600" />
              Bilhetes de Rifas Pendentes
            </CardTitle>
            <CardDescription>
              Confirme os pagamentos dos bilhetes de rifa reservados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRifas ? (
              <div className="text-center py-4">Carregando...</div>
            ) : bilhetesRifa && bilhetesRifa.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bilhetesRifa.map((bilhete) => (
                    <TableRow key={bilhete.id}>
                      <TableCell className="font-medium">
                        {bilhete.rifas?.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{bilhete.numero}</Badge>
                      </TableCell>
                      <TableCell>{bilhete.nome_comprador}</TableCell>
                      <TableCell className="font-mono text-sm">{bilhete.cpf}</TableCell>
                      <TableCell className="font-mono text-sm">{bilhete.telefone}</TableCell>
                      <TableCell>{formatDate(bilhete.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => confirmarPagamentoRifa.mutate(bilhete.id)}
                            disabled={confirmarPagamentoRifa.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejeitarPagamento.mutate({ id: bilhete.id, tipo: "rifa" })}
                            disabled={rejeitarPagamento.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum bilhete de rifa pendente de confirmação</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campanhas Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Bilhetes de Campanhas Pendentes
            </CardTitle>
            <CardDescription>
              Confirme os pagamentos dos bilhetes de campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCampanhas ? (
              <div className="text-center py-4">Carregando...</div>
            ) : bilhetesCampanha && bilhetesCampanha.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bilhetesCampanha.map((bilhete) => (
                    <TableRow key={bilhete.id}>
                      <TableCell className="font-medium">
                        {bilhete.campanhas?.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{bilhete.quantidade} bilhetes</Badge>
                      </TableCell>
                      <TableCell>{bilhete.nome_comprador}</TableCell>
                      <TableCell className="font-mono text-sm">{bilhete.cpf}</TableCell>
                      <TableCell className="font-mono text-sm">{bilhete.telefone}</TableCell>
                      <TableCell>{formatDate(bilhete.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => confirmarPagamentoCampanha.mutate(bilhete.id)}
                            disabled={confirmarPagamentoCampanha.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejeitarPagamento.mutate({ id: bilhete.id, tipo: "campanha" })}
                            disabled={rejeitarPagamento.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum bilhete de campanha pendente de confirmação</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmarPagamentos;
