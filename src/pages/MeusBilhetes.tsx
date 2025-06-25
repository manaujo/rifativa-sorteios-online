
import { useState } from "react";
import Header from "@/components/Header";
import SearchForm from "@/components/meus-bilhetes/SearchForm";
import BilhetesList from "@/components/meus-bilhetes/BilhetesList";
import ErrorMessage from "@/components/meus-bilhetes/ErrorMessage";
import { useMeusBilhetes } from "@/hooks/useMeusBilhetes";

const MeusBilhetes = () => {
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  const { data: bilhetes, isLoading, error } = useMeusBilhetes({
    cpf,
    telefone,
    shouldSearch
  });

  const handleSearch = (searchCpf: string, searchTelefone: string) => {
    setCpf(searchCpf);
    setTelefone(searchTelefone);
    setShouldSearch(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Meus Bilhetes
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Consulte seus bilhetes de rifas e campanhas usando os dados fornecidos na compra.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        <ErrorMessage error={error} />

        <BilhetesList 
          bilhetes={bilhetes} 
          shouldSearch={shouldSearch} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default MeusBilhetes;
