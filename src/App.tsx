
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import CriarRifa from "./pages/CriarRifa";
import CriarCampanha from "./pages/CriarCampanha";
import Rifas from "./pages/Rifas";
import Campanhas from "./pages/Campanhas";
import RifaDetalhes from "./pages/RifaDetalhes";
import CampanhaDetalhes from "./pages/CampanhaDetalhes";
import MinhasRifas from "./pages/MinhasRifas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/criar-rifa" element={<CriarRifa />} />
          <Route path="/criar-campanha" element={<CriarCampanha />} />
          <Route path="/rifas" element={<Rifas />} />
          <Route path="/campanhas" element={<Campanhas />} />
          <Route path="/rifa/:id" element={<RifaDetalhes />} />
          <Route path="/campanha/:id" element={<CampanhaDetalhes />} />
          <Route path="/minhas-rifas" element={<MinhasRifas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
