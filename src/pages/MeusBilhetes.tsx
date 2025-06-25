
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Ticket, Search, Crown } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const MeusBilhetes = () => {
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);
  const { toast } = useToast();

  const { data: bilhetes, isLoading, error } = useQuery({
    queryKey: ["meus-bilhetes", cpf, telefone],
    queryFn: async () => {
      // Busca bilhetes de rifas
      const { data: bilhetesRifa, error: errorRifa } = await supabase
        .from("bilhetes_rifa")
        .select(`
          id,
          numero,
          status,
          is_ganhador,
          created_at,
          rifas (
            id,
            titulo,
            status as rifa_status
          )
        `)
        .eq("cpf", cpf)
        .eq("telefone", telefone);

      if (errorRifa) throw errorRifa;

      // Busca bilhetes de campanhas
      const { data: bilhetesCampanha, error: errorCampanha } = await supabase
        .from("bilhetes_campanha")
        .select(`
          id,
          numero,
          quantidade,
          status,
          is_ganhador,
          created_at,
          campanhas (
            id,
            titulo
          )
        `)
        .eq("cpf", cpf)
        .eq("telefone", telefone);

      if (errorCampanha) throw errorCampanha;

      // Combina e formata os resultados
      const resultados = [
        ...(bilhetesRifa || []).map(bilhete => ({
          id: bilhete.id,
          numero: bilhete.numero,
          quantidade: 1,
          status: bilhete.status,
          is_ganhador: bilhete.is_ganhador,
          created_at: bilhete.created_at,
          titulo: bilhete.rifas?.titulo || "Rifa removida",
          tipo: "rifa" as const,
          rifa_status: bilhete.rifas?.status,
          item_id: bilhete.rifas?.id
        })),
        ...(bilhetesCampanha || []).map(bilhete => ({
          id: bilhete.id,
          numero: bilhete.numero,
          quantidade: bilhete.quantidade,
          status: bilhete.status,
          is_ganhador: bilhete.is_ganhador,
          created_at: bilhete.created_at,
          titulo: bilhete.campanhas?.titulo || "Campanha removida",
          tipo: "campanha" as const,
          item_id: bilhete.campanhas?.id
        }))
      ];

      return resultados.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    },
    enabled: shouldSearch && cpf.length > 0 && telefone.length > 0,
  });

  const handleSearch = () => {
    if (!cpf || !telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha CPF e telefone.",
        variant: "destructive",
      });
      return;
    }
    setShouldSearch(true);
  };

  const getStatusBadge = (status: string, tipo: string) => {
    if (tipo === "rifa") {
      switch (status) {
        case "disponivel":
          return <Badge variant="secondary">Disponível</Badge>;
        case "reservado":
          return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Reservado</Badge>;
        case "confirmado":
          return <Badge variant="default" className="bg-green-600">Confirmado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case "aguardando":
          return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Aguardando</Badge>;
        case "pago":
          return <Badge variant="default" className="bg-green-600">Pago</Badge>;
        case "cancelado":
          return <Badge variant="destructive">Cancelado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Meus Bilhetes
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Consulte seus bilhetes de rifas e campanhas usando os dados fornecidos na compra.
          </p>
        </div>

        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Bilhetes
            </CardTitle>
            <CardDescription>
              Informe o CPF e telefone usados na compra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                CPF
              </label>
              <Input
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Telefone
              </label>
              <Input
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
              {isLoading ? "Buscando..." : "Buscar Bilhetes"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600 text-center">
                  Erro ao buscar bilhetes. Tente novamente.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {bilhetes && bilhetes.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Seus Bilhetes ({bilhetes.length})
            </h2>
            <div className="grid gap-4">
              {bilhetes.map((bilhete) => (
                <Card key={bilhete.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bilhete.tipo === "rifa" ? (
                          <Trophy className="w-6 h-6 text-amber-600" />
                        ) : (
                          <Ticket className="w-6 h-6 text-blue-600" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{bilhete.titulo}</CardTitle>
                          <CardDescription>
                            {bilhete.tipo === "rifa" ? "Rifa" : "Campanha"}
                          </CardDescription>
                        </div>
                      </div>
                      {bilhete.is_ganhador && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1 rounded-full">
                          <Crown className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-800 font-semibold">VENCEDOR!</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Número</p>
                        <p className="font-semibold">
                          {bilhete.numero || "N/A"}
                        </p>
                      </div>
                      {bilhete.tipo === "campanha" && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Quantidade</p>
                          <p className="font-semibold">{bilhete.quantidade}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        {getStatusBadge(bilhete.status || "", bilhete.tipo)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Data</p>
                        <p className="font-semibold">
                          {bilhete.created_at ? new Date(bilhete.created_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    {bilhete.tipo === "rifa" && bilhete.rifa_status === "encerrada" && !bilhete.is_ganhador && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">Esta rifa já foi sorteada. Você não foi contemplado desta vez.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {shouldSearch && bilhetes && bilhetes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              Nenhum bilhete encontrado
            </h3>
            <p className="text-gray-500 text-lg">
              Não encontramos bilhetes com esses dados. Verifique se o CPF e telefone estão corretos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusBilhetes;
