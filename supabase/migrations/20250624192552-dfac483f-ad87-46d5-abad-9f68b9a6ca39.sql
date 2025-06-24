
-- Create enum types
CREATE TYPE public.plano_type AS ENUM ('economico', 'padrao', 'premium');
CREATE TYPE public.status_rifa AS ENUM ('ativa', 'encerrada');
CREATE TYPE public.status_bilhete AS ENUM ('disponivel', 'reservado', 'confirmado');
CREATE TYPE public.modo_campanha AS ENUM ('simples', 'combo');
CREATE TYPE public.status_bilhete_campanha AS ENUM ('aguardando', 'pago', 'cancelado');
CREATE TYPE public.tipo_pagamento AS ENUM ('rifa', 'campanha');
CREATE TYPE public.status_pagamento AS ENUM ('pendente', 'confirmado', 'cancelado');
CREATE TYPE public.metodo_pagamento AS ENUM ('pix');

-- Create users table (profiles)
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  plano plano_type DEFAULT 'economico',
  total_rifas INTEGER DEFAULT 0,
  total_campanhas INTEGER DEFAULT 0,
  chave_pix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rifas table
CREATE TABLE public.rifas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem TEXT,
  valor_bilhete DECIMAL(10,2) NOT NULL,
  quantidade_bilhetes INTEGER NOT NULL,
  bilhete_premiado INTEGER,
  status status_rifa DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bilhetes_rifa table
CREATE TABLE public.bilhetes_rifa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rifa_id UUID REFERENCES public.rifas(id) ON DELETE CASCADE NOT NULL,
  numero INTEGER NOT NULL,
  nome_comprador TEXT,
  cpf TEXT,
  telefone TEXT,
  status status_bilhete DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rifa_id, numero)
);

-- Create campanhas table
CREATE TABLE public.campanhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco_bilhete DECIMAL(10,2) NOT NULL,
  modo modo_campanha DEFAULT 'simples',
  destaque BOOLEAN DEFAULT FALSE,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bilhetes_campanha table
CREATE TABLE public.bilhetes_campanha (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE NOT NULL,
  nome_comprador TEXT NOT NULL,
  cpf TEXT NOT NULL,
  telefone TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  status status_bilhete_campanha DEFAULT 'aguardando',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pagamentos table
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo tipo_pagamento NOT NULL,
  referencia_id UUID NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status status_pagamento DEFAULT 'pendente',
  comprador_nome TEXT NOT NULL,
  comprador_cpf TEXT NOT NULL,
  comprador_telefone TEXT NOT NULL,
  metodo metodo_pagamento DEFAULT 'pix',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bilhetes_rifa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bilhetes_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rifas table
CREATE POLICY "Users can view own rifas" ON public.rifas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rifas" ON public.rifas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rifas" ON public.rifas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rifas" ON public.rifas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view active rifas" ON public.rifas
  FOR SELECT USING (status = 'ativa');

-- RLS Policies for bilhetes_rifa table
CREATE POLICY "Rifa owners can view bilhetes" ON public.bilhetes_rifa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rifas 
      WHERE rifas.id = bilhetes_rifa.rifa_id 
      AND rifas.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert bilhetes" ON public.bilhetes_rifa
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Rifa owners can update bilhetes" ON public.bilhetes_rifa
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.rifas 
      WHERE rifas.id = bilhetes_rifa.rifa_id 
      AND rifas.user_id = auth.uid()
    )
  );

-- RLS Policies for campanhas table
CREATE POLICY "Users can view own campanhas" ON public.campanhas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campanhas" ON public.campanhas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campanhas" ON public.campanhas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campanhas" ON public.campanhas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view campanhas" ON public.campanhas
  FOR SELECT USING (true);

-- RLS Policies for bilhetes_campanha table
CREATE POLICY "Campanha owners can view bilhetes" ON public.bilhetes_campanha
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = bilhetes_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert bilhetes campanha" ON public.bilhetes_campanha
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Campanha owners can update bilhetes" ON public.bilhetes_campanha
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = bilhetes_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

-- RLS Policies for pagamentos table
CREATE POLICY "Users can view related pagamentos" ON public.pagamentos
  FOR SELECT USING (
    (tipo = 'rifa' AND EXISTS (
      SELECT 1 FROM public.rifas 
      WHERE rifas.id = pagamentos.referencia_id 
      AND rifas.user_id = auth.uid()
    )) OR 
    (tipo = 'campanha' AND EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = pagamentos.referencia_id 
      AND campanhas.user_id = auth.uid()
    ))
  );

CREATE POLICY "Anyone can insert pagamentos" ON public.pagamentos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update related pagamentos" ON public.pagamentos
  FOR UPDATE USING (
    (tipo = 'rifa' AND EXISTS (
      SELECT 1 FROM public.rifas 
      WHERE rifas.id = pagamentos.referencia_id 
      AND rifas.user_id = auth.uid()
    )) OR 
    (tipo = 'campanha' AND EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = pagamentos.referencia_id 
      AND campanhas.user_id = auth.uid()
    ))
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('rifas_fotos', 'rifas_fotos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('campanhas_fotos', 'campanhas_fotos', true);

-- Storage policies
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('rifas_fotos', 'campanhas_fotos'));

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') 
    AND auth.role() = 'authenticated'
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nome, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), 
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
