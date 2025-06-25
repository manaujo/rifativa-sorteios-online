
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Trophy } from "lucide-react";

interface Premio {
  id?: string;
  titulo: string;
  descricao: string;
  posicao: number;
}

interface FormularioPremiosProps {
  premios: Premio[];
  onChange: (premios: Premio[]) => void;
}

const FormularioPremios = ({ premios, onChange }: FormularioPremiosProps) => {
  const adicionarPremio = () => {
    const novoPremio: Premio = {
      titulo: "",
      descricao: "",
      posicao: premios.length + 1
    };
    onChange([...premios, novoPremio]);
  };

  const removerPremio = (index: number) => {
    const novosPremios = premios.filter((_, i) => i !== index);
    // Reordenar posições
    const premiosReordenados = novosPremios.map((premio, i) => ({
      ...premio,
      posicao: i + 1
    }));
    onChange(premiosReordenados);
  };

  const atualizarPremio = (index: number, campo: keyof Premio, valor: string | number) => {
    const novosPremios = premios.map((premio, i) => 
      i === index ? { ...premio, [campo]: valor } : premio
    );
    onChange(novosPremios);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Prêmios da Campanha
        </CardTitle>
        <CardDescription>
          Defina os prêmios que serão sorteados nesta campanha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {premios.map((premio, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">
                  {index + 1}º Prêmio
                </h4>
                {premios.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerPremio(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Título do Prêmio
                </label>
                <Input
                  placeholder="Ex: iPhone 15 Pro Max"
                  value={premio.titulo}
                  onChange={(e) => atualizarPremio(index, "titulo", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descrição (opcional)
                </label>
                <Textarea
                  placeholder="Descreva o prêmio..."
                  value={premio.descricao}
                  onChange={(e) => atualizarPremio(index, "descricao", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={adicionarPremio}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Prêmio
        </Button>

        {premios.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum prêmio adicionado ainda</p>
            <p className="text-sm">Clique em "Adicionar Prêmio" para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormularioPremios;
