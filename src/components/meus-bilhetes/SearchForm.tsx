
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (cpf: string, telefone: string) => void;
  isLoading: boolean;
}

const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const { toast } = useToast();

  const handleSearch = () => {
    if (!cpf || !telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha CPF e telefone.",
        variant: "destructive",
      });
      return;
    }
    onSearch(cpf, telefone);
  };

  return (
    <Card className="max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Buscar Bilhetes
        </CardTitle>
        <CardDescription>
          Informe o CPF e telefone usados na compra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            CPF
          </label>
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Telefone
          </label>
          <Input
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
          {isLoading ? "Buscando..." : "Buscar Bilhetes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
