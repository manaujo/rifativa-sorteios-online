
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, CircleDot } from "lucide-react";

interface BilheteRifa {
  numero: number;
  status: "disponivel" | "reservado" | "confirmado";
  nome_comprador?: string;
  is_ganhador?: boolean;
}

interface GridNumerosRifaProps {
  bilhetes: BilheteRifa[];
  onNumeroSelect: (numeros: number[]) => void;
  rifaEncerrada?: boolean;
  numeroGanhador?: number;
}

const GridNumerosRifa = ({ bilhetes, onNumeroSelect, rifaEncerrada = false, numeroGanhador }: GridNumerosRifaProps) => {
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([]);

  const handleNumeroClick = (numero: number) => {
    if (rifaEncerrada) return;
    
    const bilhete = bilhetes.find(b => b.numero === numero);
    if (bilhete?.status !== "disponivel") return;

    const novosNumeros = numerosSelecionados.includes(numero)
      ? numerosSelecionados.filter(n => n !== numero)
      : [...numerosSelecionados, numero];
    
    setNumerosSelecionados(novosNumeros);
    onNumeroSelect(novosNumeros);
  };

  const getNumeroStyle = (numero: number, bilhete?: BilheteRifa) => {
    if (rifaEncerrada && numeroGanhador === numero) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600 shadow-lg transform scale-105";
    }
    
    if (bilhete?.is_ganhador) {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600 shadow-lg";
    }
    
    if (numerosSelecionados.includes(numero)) {
      return "bg-primary text-white border-primary";
    }

    if (!bilhete || bilhete.status === "disponivel") {
      return "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-primary";
    }

    switch (bilhete.status) {
      case "reservado":
        return "bg-yellow-100 border-yellow-300 text-yellow-700 cursor-not-allowed";
      case "confirmado":
        return "bg-green-100 border-green-300 text-green-700 cursor-not-allowed";
      default:
        return "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed";
    }
  };

  const getNumeroIcon = (numero: number, bilhete?: BilheteRifa) => {
    if (rifaEncerrada && numeroGanhador === numero) {
      return <Check className="w-4 h-4" />;
    }
    
    if (bilhete?.is_ganhador) {
      return <Check className="w-4 h-4" />;
    }
    
    if (!bilhete || bilhete.status === "disponivel") {
      return <CircleDot className="w-4 h-4" />;
    }

    switch (bilhete.status) {
      case "reservado":
        return <Clock className="w-4 h-4" />;
      case "confirmado":
        return <Check className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Criar grid com todos os números de 1 até o maior número
  const maxNumero = Math.max(...bilhetes.map(b => b.numero), 0);
  const todosNumeros = Array.from({ length: maxNumero }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Números da Rifa</CardTitle>
          <CardDescription>
            {rifaEncerrada 
              ? "Esta rifa já foi sorteada. Veja abaixo o número ganhador."
              : "Clique nos números disponíveis para selecioná-los"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 mb-6">
            {todosNumeros.map((numero) => {
              const bilhete = bilhetes.find(b => b.numero === numero);
              return (
                <Button
                  key={numero}
                  variant="outline"
                  size="sm"
                  className={`h-12 relative ${getNumeroStyle(numero, bilhete)}`}
                  onClick={() => handleNumeroClick(numero)}
                  disabled={rifaEncerrada || (bilhete && bilhete.status !== "disponivel")}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold">{numero}</span>
                    {getNumeroIcon(numero, bilhete)}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Confirmado</span>
            </div>
            {(rifaEncerrada || bilhetes.some(b => b.is_ganhador)) && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                <span>Ganhador</span>
              </div>
            )}
          </div>

          {numerosSelecionados.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Números selecionados:</strong> {numerosSelecionados.sort((a, b) => a - b).join(", ")}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Total: {numerosSelecionados.length} número(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GridNumerosRifa;
