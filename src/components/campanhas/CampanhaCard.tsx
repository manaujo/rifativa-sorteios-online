
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Share2, Target, Star, Users } from "lucide-react";

interface CampanhaCardProps {
  campanha: {
    id: string;
    titulo: string;
    descricao: string;
    preco_bilhete: number;
    modo: string;
    destaque: boolean;
    imagem: string | null;
    users: { nome: string };
    bilhetes_campanha?: Array<{
      quantidade: number;
      status: string;
    }>;
  };
  onShare: (campanhaId: string, titulo: string) => void;
}

const CampanhaCard = ({ campanha, onShare }: CampanhaCardProps) => {
  const totalBilhetes = campanha.bilhetes_campanha?.reduce(
    (acc, bilhete) => acc + bilhete.quantidade, 0
  ) || 0;
  const totalArrecadado = totalBilhetes * Number(campanha.preco_bilhete);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 relative group">
      {campanha.destaque && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500 text-white animate-pulse">
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Target className="w-3 h-3 mr-1" />
            {campanha.modo === 'simples' ? 'Simples' : 'Combo'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(campanha.id, campanha.titulo)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
        
        <CardTitle className="text-lg line-clamp-2 mb-1">{campanha.titulo}</CardTitle>
        <p className="text-sm text-gray-600 flex items-center">
          <Users className="w-3 h-3 mr-1" />
          Por: {campanha.users?.nome}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-gray-700 line-clamp-2 text-sm">{campanha.descricao}</p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Arrecadado</span>
              <span className="text-xs font-medium text-green-700">
                {totalBilhetes} bilhetes
              </span>
            </div>
            <div className="text-lg font-bold text-green-600">
              R$ {totalArrecadado.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary-600">
                R$ {Number(campanha.preco_bilhete).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">por bilhete</p>
            </div>
            
            <Link to={`/campanha/${campanha.id}`}>
              <Button className="bg-gradient-primary hover:opacity-90 hover:scale-105 transition-all">
                Participar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampanhaCard;
