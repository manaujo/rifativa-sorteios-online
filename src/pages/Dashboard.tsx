
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Navigate } from "react-router-dom";
import { Plus, Trophy, Target, User, LogOut, Eye, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();

  const { data: rifas } = useQuery({
    queryKey: ["rifas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rifas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: campanhas } = useQuery({
    queryKey: ["campanhas", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("campanhas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const getPlanoLabel = (plano: string) => {
    switch (plano) {
      case "economico":
        return "Econômico";
      case "padrao":
        return "Padrão";
      case "premium":
        return "Premium";
      default:
        return plano;
    }
  };

  const getPlanoLimits = (plano: string) => {
    switch (plano) {
      case "economico":
        return { rifas: 2, campanhas: 2, bilhetes: 100000 };
      case "padrao":
        return { rifas: 5, campanhas: 5, bilhetes: 500000 };
      case "premium":
        return { rifas: 10, campanhas: 10, bilhetes: 1000000 };
      default:
        return { rifas: 0, campanhas: 0, bilhetes: 0 };
    }
  };

  const limits = getPlanoLimits(profile.plano || "economico");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Rifativa</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/confirmar-pagamentos">
                <Button variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Pagamentos
                </Button>
              </Link>
              <Link to="/minhas-rifas">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Minhas Rifas
                </Button>
              </Link>
              <Link to="/perfil">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {profile.nome}! 👋
          </h1>
          <p className="text-gray-600">
            Plano: <span className="font-semibold text-primary-600">{getPlanoLabel(profile.plano || "economico")}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Criadas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rifas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Limite: {limits.rifas}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Criadas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campanhas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Limite: {limits.campanhas}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chave PIX</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {profile.chave_pix ? "Configurada" : "Não configurada"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.chave_pix ? profile.chave_pix : "Configure sua chave PIX"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary-600" />
                <span>Criar Nova Rifa</span>
              </CardTitle>
              <CardDescription>
                Crie rifas com números limitados e sorteio automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/criar-rifa">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Rifa
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary-600" />
                <span>Criar Nova Campanha</span>
              </CardTitle>
              <CardDescription>
                Crie campanhas de arrecadação com bilhetes ilimitados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/criar-campanha">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Campanha
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Rifas */}
          <Card>
            <CardHeader>
              <CardTitle>Rifas Recentes</CardTitle>
              <CardDescription>Suas rifas mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {rifas && rifas.length > 0 ? (
                <div className="space-y-3">
                  {rifas.slice(0, 3).map((rifa) => (
                    <div key={rifa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{rifa.titulo}</p>
                        <p className="text-sm text-gray-600">
                          R$ {Number(rifa.valor_bilhete).toFixed(2)} por bilhete
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rifa.status === 'ativa' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rifa.status === 'ativa' ? 'Ativa' : 'Encerrada'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma rifa criada ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Campanhas */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Suas campanhas mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              {campanhas && campanhas.length > 0 ? (
                <div className="space-y-3">
                  {campanhas.slice(0, 3).map((campanha) => (
                    <div key={campanha.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{campanha.titulo}</p>
                        <p className="text-sm text-gray-600">
                          R$ {Number(campanha.preco_bilhete).toFixed(2)} por bilhete
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campanha.destaque 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {campanha.modo === 'simples' ? 'Simples' : 'Combo'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma campanha criada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
