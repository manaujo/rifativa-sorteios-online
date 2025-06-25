
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import BilheteCard from "./BilheteCard";

interface BilhetesListProps {
  bilhetes: Array<{
    id: string;
    numero: number | null;
    quantidade: number;
    status: string | null;
    is_ganhador: boolean | null;
    created_at: string | null;
    titulo: string;
    tipo: "rifa" | "campanha";
    rifa_status?: string;
  }> | null;
  shouldSearch: boolean;
  isLoading: boolean;
}

const BilhetesList = ({ bilhetes, shouldSearch, isLoading }: BilhetesListProps) => {
  if (bilhetes && bilhetes.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Seus Bilhetes ({bilhetes.length})
        </h2>
        <div className="grid gap-4">
          {bilhetes.map((bilhete) => (
            <BilheteCard key={bilhete.id} bilhete={bilhete} />
          ))}
        </div>
      </div>
    );
  }

  if (shouldSearch && bilhetes && bilhetes.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-gray-600 mb-4">
          Nenhum bilhete encontrado
        </h3>
        <p className="text-gray-500 text-lg">
          Não encontramos bilhetes com esses dados. Verifique se o CPF e telefone estão corretos.
        </p>
      </div>
    );
  }

  return null;
};

export default BilhetesList;
