
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlanValidation } from "@/hooks/usePlanValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Key, Crown, Trophy, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Perfil = () => {
  const { user, profile, loading } = useAuth();
  const { rifasCount, campanhasCount, limits, currentPlan } = usePlanValidation();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    email: profile?.email || "",
    chave_pix: profile?.chave_pix || ""
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          nome: formData.nome,
          email: formData.email,
          chave_pix: formData.chave_pix
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
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

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "economico":
        return "bg-blue-500";
      case "padrao":
        return "bg-green-500";
      case "premium":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
            </Link>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Rifativa</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                    {profile.nome?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile.nome}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getPlanoColor(currentPlan)}`} />
                    <span className="font-semibold">{getPlanoLabel(currentPlan)}</span>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Plano Ativo
                  </Badge>
                </div>

                <Link to="/upgrade" className="block">
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-xl border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-primary-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{rifasCount}</div>
                    <div className="text-xs text-blue-600">Rifas</div>
                    <div className="text-xs text-gray-500">{rifasCount}/{limits.rifas}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{campanhasCount}</div>
                    <div className="text-xs text-green-600">Campanhas</div>
                    <div className="text-xs text-gray-500">{campanhasCount}/{limits.campanhas}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chave_pix" className="flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Chave PIX
                    </Label>
                    <Input
                      id="chave_pix"
                      type="text"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      value={formData.chave_pix}
                      onChange={(e) => handleInputChange("chave_pix", e.target.value)}
                      className="h-12"
                    />
                    <p className="text-sm text-gray-600 flex items-start">
                      <Key className="w-4 h-4 mr-1 mt-0.5 text-gray-400" />
                      Esta chave será usada para receber os pagamentos das suas rifas e campanhas
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 text-lg"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
