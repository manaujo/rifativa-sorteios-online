
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Share2, Target, Star } from "lucide-react";
import Header from "@/components/Header";

const Campanhas = () => {
  const { data: campanhas, isLoading } = useQuery({
    queryKey: ["public-campanhas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_campanha(id, quantidade, status)
        `)
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleShare = (campanhaId: string, titulo: string) => {
    const url = `${window.location.origin}/campanha/${campanhaId}`;
    if (navigator.share) {
      navigator.share({
        title: `Campanha: ${titulo}`,
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
          <div className="text-center">Carregando campanhas...</div>
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
            Campanhas de Arrecadação
          </h1>
          <p className="text-gray-600 text-lg">
            Apoie causas importantes comprando bilhetes ilimitados!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campanhas?.map((campanha) => {
            const totalBilhetes = campanha.bilhetes_campanha?.reduce(
              (acc: number, bilhete: any) => acc + bilhete.quantidade, 0
            ) || 0;
            const totalArrecadado = totalBilhetes * Number(campanha.preco_bilhete);

            return (
              <Card key={campanha.id} className="hover:shadow-lg transition-shadow relative">
                {campanha.destaque && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  </div>
                )}

                {campanha.imagem && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={campanha.imagem}
                      alt={campanha.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Target className="w-3 h-3 mr-1" />
                      {campanha.modo === 'simples' ? 'Simples' : 'Combo'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(campanha.id, campanha.titulo)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <CardTitle className="text-xl">{campanha.titulo}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Por: {campanha.users?.nome}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 line-clamp-2">{campanha.descricao}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Arrecadado</span>
                        <span className="text-sm font-medium">
                          {totalBilhetes} bilhetes
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {totalArrecadado.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          R$ {Number(campanha.preco_bilhete).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">por bilhete</p>
                      </div>
                      
                      <Link to={`/campanha/${campanha.id}`}>
                        <Button className="bg-gradient-primary hover:opacity-90">
                          Apoiar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {campanhas && campanhas.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma campanha disponível no momento
            </h3>
            <p className="text-gray-500">
              Volte em breve para conferir novas campanhas!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campanhas;
