
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Users } from "lucide-react";

interface Comprador {
  nome_comprador: string;
  total_bilhetes: number;
  total_gasto: number;
}

interface RankingCompradoresProps {
  compradores: Comprador[];
  precoBilhete: number;
}

const RankingCompradores = ({ compradores, precoBilhete }: RankingCompradoresProps) => {
  const rankingIcons = [
    { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
    { icon: Medal, color: "text-gray-400", bg: "bg-gray-50" },
    { icon: Award, color: "text-amber-600", bg: "bg-amber-50" }
  ];

  if (!compradores || compradores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="w-5 h-5 mr-2" />
            Ranking de Apoiadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Seja o primeiro a apoiar esta campanha!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Users className="w-5 h-5 mr-2" />
          Ranking de Apoiadores
        </CardTitle>
        <p className="text-sm text-gray-600">
          Quem mais apoia esta campanha
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {compradores.slice(0, 10).map((comprador, index) => {
            const IconComponent = rankingIcons[index]?.icon || Users;
            const iconColor = rankingIcons[index]?.color || "text-gray-500";
            const iconBg = rankingIcons[index]?.bg || "bg-gray-50";
            
            return (
              <div key={`${comprador.nome_comprador}-${index}`} 
                   className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${iconBg}`}>
                    <IconComponent className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{comprador.nome_comprador}</p>
                    <p className="text-xs text-gray-600">
                      {comprador.total_bilhetes} bilhetes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    R$ {(comprador.total_bilhetes * precoBilhete).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingCompradores;
