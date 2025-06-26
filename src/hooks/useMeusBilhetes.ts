
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseMeusBilhetesProps {
  cpf: string;
  telefone: string;
  shouldSearch: boolean;
}

export const useMeusBilhetes = ({ cpf, telefone, shouldSearch }: UseMeusBilhetesProps) => {
  return useQuery({
    queryKey: ["meus-bilhetes", cpf, telefone],
    queryFn: async () => {
      console.log("Buscando bilhetes para:", { cpf, telefone });
      
      // Busca bilhetes de rifas
      const { data: bilhetesRifa, error: errorRifa } = await supabase
        .from("bilhetes_rifa")
        .select(`
          id,
          numero,
          status,
          is_ganhador,
          created_at,
          nome_comprador,
          rifas (
            id,
            titulo,
            status,
            data_sorteio
          )
        `)
        .eq("cpf", cpf)
        .eq("telefone", telefone);

      if (errorRifa) {
        console.error("Erro ao buscar bilhetes de rifa:", errorRifa);
        throw errorRifa;
      }

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
          nome_comprador,
          campanhas (
            id,
            titulo
          )
        `)
        .eq("cpf", cpf)
        .eq("telefone", telefone);

      if (errorCampanha) {
        console.error("Erro ao buscar bilhetes de campanha:", errorCampanha);
        throw errorCampanha;
      }

      console.log("Bilhetes encontrados:", { 
        rifas: bilhetesRifa?.length || 0, 
        campanhas: bilhetesCampanha?.length || 0 
      });

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
          data_sorteio: bilhete.rifas?.data_sorteio,
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

      return resultados.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    },
    enabled: shouldSearch && cpf.length > 0 && telefone.length > 0,
  });
};
