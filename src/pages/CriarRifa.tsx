import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlanValidation } from "@/hooks/usePlanValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CriarRifa = () => {
  const { user, profile, loading } = useAuth();
  const { canCreateRifa, rifasCount, limits } = usePlanValidation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    valor_bilhete: "",
    quantidade_bilhetes: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  if (!canCreateRifa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Limite de Rifas Atingido</CardTitle>
                <CardDescription>
                  Você já criou {rifasCount} de {limits.rifas} rifas permitidas no seu plano atual.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Para criar mais rifas, faça upgrade do seu plano e tenha acesso a mais recursos.
                </p>
                <Link to="/#planos">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    Fazer Upgrade do Plano
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('rifas_fotos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('rifas_fotos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.chave_pix) {
      toast({
        title: "Erro",
        description: "Configure sua chave PIX no perfil antes de criar uma rifa.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Erro ao fazer upload da imagem");
        }
      }

      const { data: rifaData, error: rifaError } = await supabase
        .from("rifas")
        .insert({
          user_id: user.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          valor_bilhete: parseFloat(formData.valor_bilhete),
          quantidade_bilhetes: parseInt(formData.quantidade_bilhetes),
          imagem: imageUrl,
          status: "ativa"
        })
        .select()
        .single();

      if (rifaError) {
        throw rifaError;
      }

      const bilhetes = Array.from({ length: parseInt(formData.quantidade_bilhetes) }, (_, i) => ({
        rifa_id: rifaData.id,
        numero: i + 1,
        status: "disponivel" as const
      }));

      const { error: bilhetesError } = await supabase
        .from("bilhetes_rifa")
        .insert(bilhetes);

      if (bilhetesError) {
        throw bilhetesError;
      }

      toast({
        title: "Rifa criada com sucesso!",
        description: "Sua rifa está ativa e pronta para receber participantes.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating rifa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a rifa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Criar Nova Rifa</CardTitle>
              <CardDescription>
                Preencha os dados para criar sua rifa ({rifasCount}/{limits.rifas} rifas criadas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Rifa</Label>
                  <Input
                    id="titulo"
                    type="text"
                    placeholder="Ex: Rifa do iPhone 15 Pro"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva sua rifa, prêmio e regras..."
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_bilhete">Valor do Bilhete (R$)</Label>
                    <Input
                      id="valor_bilhete"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="5.00"
                      value={formData.valor_bilhete}
                      onChange={(e) => handleInputChange("valor_bilhete", e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade_bilhetes">Quantidade de Bilhetes</Label>
                    <Input
                      id="quantidade_bilhetes"
                      type="number"
                      min="1"
                      max={limits.bilhetes}
                      placeholder="100"
                      value={formData.quantidade_bilhetes}
                      onChange={(e) => handleInputChange("quantidade_bilhetes", e.target.value)}
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">
                      Máximo: {limits.bilhetes.toLocaleString()} bilhetes no seu plano
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">Imagem da Rifa</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="h-12"
                    />
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Adicione uma imagem do prêmio (opcional)
                  </p>
                </div>

                {!profile.chave_pix && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      ⚠️ Configure sua chave PIX no <Link to="/perfil" className="underline font-semibold">perfil</Link> antes de criar uma rifa.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Resumo da Rifa</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Valor por bilhete: R$ {formData.valor_bilhete || "0,00"}</p>
                    <p>• Total de bilhetes: {formData.quantidade_bilhetes || "0"}</p>
                    <p>• Arrecadação total: R$ {(parseFloat(formData.valor_bilhete || "0") * parseInt(formData.quantidade_bilhetes || "0")).toFixed(2)}</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-lg"
                  disabled={isCreating || !profile.chave_pix}
                >
                  {isCreating ? "Criando Rifa..." : "Criar Rifa"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarRifa;
