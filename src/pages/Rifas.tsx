
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Share2, Trophy } from "lucide-react";
import Header from "@/components/Header";

const Rifas = () => {
  const { data: rifas, isLoading } = useQuery({
    queryKey: ["public-rifas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rifas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_rifa(id, status)
        `)
        .eq("status", "ativa")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
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
      alert("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando rifas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Rifas Disponíveis
          </h1>
          <p className="text-gray-600 text-lg">
            Participe das rifas e concorra a prêmios incríveis!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rifas?.map((rifa) => {
            const bilhetesVendidos = rifa.bilhetes_rifa?.filter(
              (b: any) => b.status === "confirmado"
            ).length || 0;
            const porcentagemVendida = (bilhetesVendidos / rifa.quantidade_bilhetes) * 100;

            return (
              <Card key={rifa.id} className="hover:shadow-lg transition-shadow">
                {rifa.imagem && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={rifa.imagem}
                      alt={rifa.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Trophy className="w-3 h-3 mr-1" />
                      Ativa
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(rifa.id, rifa.titulo)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <CardTitle className="text-xl">{rifa.titulo}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Por: {rifa.users?.nome}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 line-clamp-2">{rifa.descricao}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progresso</span>
                        <span className="text-sm font-medium">
                          {bilhetesVendidos}/{rifa.quantidade_bilhetes}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${porcentagemVendida}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {porcentagemVendida.toFixed(1)}% vendido
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          R$ {Number(rifa.valor_bilhete).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">por bilhete</p>
                      </div>
                      
                      <Link to={`/rifa/${rifa.id}`}>
                        <Button className="bg-gradient-primary hover:opacity-90">
                          Participar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {rifas && rifas.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma rifa ativa no momento
            </h3>
            <p className="text-gray-500">
              Volte em breve para conferir novas rifas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rifas;
