
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Gift, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CriarCampanha = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco_bilhete: "",
    modo: "simples",
    destaque: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [premios, setPremios] = useState<string[]>([""]);

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const addPremio = () => {
    setPremios([...premios, ""]);
  };

  const removePremio = (index: number) => {
    if (premios.length > 1) {
      setPremios(premios.filter((_, i) => i !== index));
    }
  };

  const updatePremio = (index: number, value: string) => {
    const newPremios = [...premios];
    newPremios[index] = value;
    setPremios(newPremios);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('campanhas_fotos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('campanhas_fotos')
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
        description: "Configure sua chave PIX no perfil antes de criar uma campanha.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Erro ao fazer upload da imagem");
        }
      }

      // Create campanha
      const { error: campanhaError } = await supabase
        .from("campanhas")
        .insert({
          user_id: user.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          preco_bilhete: parseFloat(formData.preco_bilhete),
          modo: formData.modo as any,
          destaque: formData.destaque,
          imagem: imageUrl
        });

      if (campanhaError) {
        throw campanhaError;
      }

      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha está ativa e pronta para receber contribuições.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating campanha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha. Tente novamente.",
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
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Criar Nova Campanha</CardTitle>
              <CardDescription>
                Preencha os dados para criar sua campanha de arrecadação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Campanha</Label>
                    <Input
                      id="titulo"
                      type="text"
                      placeholder="Ex: Ajuda para cirurgia"
                      value={formData.titulo}
                      onChange={(e) => handleInputChange("titulo", e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco_bilhete">Valor do Bilhete (R$)</Label>
                    <Input
                      id="preco_bilhete"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10.00"
                      value={formData.preco_bilhete}
                      onChange={(e) => handleInputChange("preco_bilhete", e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Conte sua história e o motivo da campanha..."
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Prêmios da Campanha</Label>
                    <Button type="button" onClick={addPremio} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Prêmio
                    </Button>
                  </div>
                  
                  {premios.map((premio, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={`Prêmio ${index + 1} (ex: TV 50 polegadas)`}
                        value={premio}
                        onChange={(e) => updatePremio(index, e.target.value)}
                        className="flex-1"
                      />
                      {premios.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePremio(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modo">Modo da Campanha</Label>
                    <Select value={formData.modo} onValueChange={(value) => handleInputChange("modo", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples - Valor fixo por bilhete</SelectItem>
                        <SelectItem value="combo">Combo - Valor = múltiplos bilhetes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imagem">Imagem da Campanha</Label>
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
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="destaque"
                    checked={formData.destaque}
                    onCheckedChange={(checked) => handleInputChange("destaque", !!checked)}
                  />
                  <Label htmlFor="destaque">Campanha em destaque</Label>
                </div>

                {!profile.chave_pix && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      ⚠️ Configure sua chave PIX no <Link to="/perfil" className="underline font-semibold">perfil</Link> antes de criar uma campanha.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Resumo da Campanha</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div className="space-y-1">
                      <p>• Modo: {formData.modo === 'simples' ? 'Simples' : 'Combo'}</p>
                      <p>• Valor por bilhete: R$ {formData.preco_bilhete || "0,00"}</p>
                    </div>
                    <div className="space-y-1">
                      <p>• Destaque: {formData.destaque ? 'Sim' : 'Não'}</p>
                      <p>• Chave PIX: {profile.chave_pix ? '✅ Configurada' : '❌ Não configurada'}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-lg"
                  disabled={isCreating || !profile.chave_pix}
                >
                  {isCreating ? "Criando Campanha..." : "Criar Campanha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarCampanha;
