
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Ticket } from "lucide-react";
import Header from "@/components/Header";

const PagamentoSucesso = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento para verificação do pagamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Confirmando seu pagamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Pagamento Confirmado!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-green-700 text-lg">
                  Seu pagamento foi processado com sucesso!
                </p>
                <p className="text-gray-600">
                  Seus bilhetes foram confirmados e você já está participando.
                </p>
                {sessionId && (
                  <p className="text-sm text-gray-500">
                    ID da transação: {sessionId}
                  </p>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-2">O que acontece agora?</h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Seus bilhetes foram registrados no sistema</li>
                  <li>• Você receberá um e-mail de confirmação (se fornecido)</li>
                  <li>• Pode consultar seus bilhetes na área "Meus Bilhetes"</li>
                  <li>• Aguarde o sorteio na data prevista</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/meus-bilhetes">
                  <Button variant="outline" className="flex items-center">
                    <Ticket className="w-4 h-4 mr-2" />
                    Ver Meus Bilhetes
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button className="bg-gradient-primary hover:opacity-90 flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PagamentoSucesso;
