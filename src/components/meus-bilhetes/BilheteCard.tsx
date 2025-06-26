
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Ticket, Crown, Clock } from "lucide-react";

interface BilheteCardProps {
  bilhete: {
    id: string;
    numero: number | null;
    quantidade: number;
    status: string | null;
    is_ganhador: boolean | null;
    created_at: string | null;
    titulo: string;
    tipo: "rifa" | "campanha";
    rifa_status?: string;
  };
}

const BilheteCard = ({ bilhete }: BilheteCardProps) => {
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
          return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Aguardando Confirmação</Badge>;
        case "pago":
          return <Badge variant="default" className="bg-green-600">Confirmado</Badge>;
        case "cancelado":
          return <Badge variant="destructive">Cancelado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

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
    <Card className="hover:shadow-lg transition-shadow">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Ticket className="w-4 h-4 mr-1" />
              {bilhete.tipo === "rifa" ? "Número" : "Quantidade"}
            </p>
            <p className="font-semibold">
              {bilhete.tipo === "rifa" 
                ? (bilhete.numero ? `#${bilhete.numero}` : "N/A")
                : `${bilhete.quantidade} bilhetes`
              }
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            {getStatusBadge(bilhete.status || "", bilhete.tipo)}
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Data da Compra
            </p>
            <p className="font-semibold text-sm">
              {bilhete.created_at ? formatDate(bilhete.created_at) : "N/A"}
            </p>
          </div>
        </div>
        
        {bilhete.tipo === "rifa" && bilhete.rifa_status === "encerrada" && !bilhete.is_ganhador && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Esta rifa já foi sorteada. Você não foi contemplado desta vez.</p>
          </div>
        )}

        {(bilhete.status === "reservado" || bilhete.status === "aguardando") && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⏳ Aguardando confirmação:</strong> O criador da {bilhete.tipo} ainda não confirmou seu pagamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BilheteCard;
