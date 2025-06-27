
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target } from "lucide-react";
import Header from "@/components/Header";
import CampanhaCard from "@/components/campanhas/CampanhaCard";

const Campanhas = () => {
  const { toast } = useToast();
  
  // Query pública - sem autenticação necessária
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
      
      if (error) {
        console.error("Erro ao buscar campanhas:", error);
        return [];
      }
      return data || [];
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
              <p className="text-gray-600">Carregando campanhas...</p>
            </div>
          </div>
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
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Apoie causas importantes comprando bilhetes ilimitados! Cada bilhete te dá uma chance de concorrer e você ainda ajuda uma causa importante.
          </p>
        </div>

        {campanhas && campanhas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campanhas.map((campanha) => (
              <CampanhaCard 
                key={campanha.id} 
                campanha={campanha} 
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Target className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              Nenhuma campanha disponível no momento
            </h3>
            <p className="text-gray-500 text-lg">
              Volte em breve para conferir novas campanhas incríveis!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campanhas;
