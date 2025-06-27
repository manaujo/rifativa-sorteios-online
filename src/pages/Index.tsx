import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Share2, Trophy, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  const { toast } = useToast();

  // Query para rifas públicas - sem autenticação necessária
  const { data: rifas } = useQuery({
    queryKey: ["public-rifas-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rifas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_rifa(id, status)
        `)
        .eq("status", "ativa")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) {
        console.error("Erro ao buscar rifas:", error);
        return [];
      }
      return data || [];
    },
  });

  // Query para campanhas públicas - sem autenticação necessária
  const { data: campanhas } = useQuery({
    queryKey: ["public-campanhas-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas")
        .select(`
          *,
          users!inner(nome),
          bilhetes_campanha(id, quantidade, status)
        `)
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) {
        console.error("Erro ao buscar campanhas:", error);
        return [];
      }
      return data || [];
    },
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

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* Seção de Rifas e Campanhas Públicas */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              🎯 Rifas e Campanhas Ativas
            </h2>
            <p className="text-xl text-gray-600">
              Participe agora e concorra a prêmios incríveis!
            </p>
          </div>

          <Tabs defaultValue="rifas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="rifas" className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Rifas
              </TabsTrigger>
              <TabsTrigger value="campanhas" className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Campanhas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rifas">
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
                            onClick={() => handleShare(rifa.id, rifa.titulo, "rifa")}
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
              
              {rifas && rifas.length > 0 && (
                <div className="text-center mt-8">
                  <Link to="/rifas">
                    <Button variant="outline" size="lg">
                      Ver Todas as Rifas
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="campanhas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campanhas?.map((campanha) => {
                  const bilhetesVendidos = campanha.bilhetes_campanha?.filter(
                    (b: any) => b.status === "pago"
                  ) || [];
                  const totalBilhetes = campanha.bilhetes_campanha?.reduce(
                    (acc: number, bilhete: any) => acc + bilhete.quantidade, 0
                  ) || 0;

                  return (
                    <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(campanha.id, campanha.titulo, "campanha")}
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
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Bilhetes vendidos:</span>
                              <span className="font-medium">{totalBilhetes}</span>
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

              {campanhas && campanhas.length > 0 && (
                <div className="text-center mt-8">
                  <Link to="/campanhas">
                    <Button variant="outline" size="lg">
                      Ver Todas as Campanhas
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Benefits />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
