
import "./App.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Upgrade from "./pages/Upgrade";
import ConfirmarPagamentos from "./pages/ConfirmarPagamentos";
import CriarRifa from "./pages/CriarRifa";
import CriarCampanha from "./pages/CriarCampanha";
import Rifas from "./pages/Rifas";
import RifaDetalhes from "./pages/RifaDetalhes";
import Campanhas from "./pages/Campanhas";
import CampanhaDetalhes from "./pages/CampanhaDetalhes";
import MinhasRifas from "./pages/MinhasRifas";
import MeusBilhetes from "./pages/MeusBilhetes";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/confirmar-pagamentos" element={<ConfirmarPagamentos />} />
              <Route path="/criar-rifa" element={<CriarRifa />} />
              <Route path="/criar-campanha" element={<CriarCampanha />} />
              <Route path="/rifas" element={<Rifas />} />
              <Route path="/rifas/:id" element={<RifaDetalhes />} />
              <Route path="/campanhas" element={<Campanhas />} />
              <Route path="/campanhas/:id" element={<CampanhaDetalhes />} />
              <Route path="/minhas-rifas" element={<MinhasRifas />} />
              <Route path="/meus-bilhetes" element={<MeusBilhetes />} />
              <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
