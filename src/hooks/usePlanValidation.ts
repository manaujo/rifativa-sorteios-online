
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlanValidation = () => {
  const { user, profile } = useAuth();

  const { data: rifasCount = 0 } = useQuery({
    queryKey: ["rifas-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("rifas")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: campanhasCount = 0 } = useQuery({
    queryKey: ["campanhas-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("campanhas")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const getPlanoLimits = (plano: string) => {
    switch (plano) {
      case "economico":
        return { rifas: 2, campanhas: 2, bilhetes: 100000 };
      case "padrao":
        return { rifas: 5, campanhas: 5, bilhetes: 500000 };
      case "premium":
        return { rifas: 10, campanhas: 10, bilhetes: 1000000 };
      default:
        return { rifas: 0, campanhas: 0, bilhetes: 0 };
    }
  };

  const limits = getPlanoLimits(profile?.plano || "economico");

  const canCreateRifa = rifasCount < limits.rifas;
  const canCreateCampanha = campanhasCount < limits.campanhas;

  return {
    rifasCount,
    campanhasCount,
    limits,
    canCreateRifa,
    canCreateCampanha,
    currentPlan: profile?.plano || "economico"
  };
};
