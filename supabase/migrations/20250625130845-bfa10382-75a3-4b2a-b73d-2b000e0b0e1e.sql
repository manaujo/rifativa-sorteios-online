
-- Adicionar campo is_ganhador nas tabelas de bilhetes
ALTER TABLE public.bilhetes_rifa 
ADD COLUMN is_ganhador BOOLEAN DEFAULT FALSE;

ALTER TABLE public.bilhetes_campanha 
ADD COLUMN is_ganhador BOOLEAN DEFAULT FALSE,
ADD COLUMN numero INTEGER;

-- Criar tabela para prêmios das campanhas
CREATE TABLE public.premios_campanha (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  posicao INTEGER NOT NULL, -- 1º prêmio, 2º prêmio, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para a tabela de prêmios
ALTER TABLE public.premios_campanha ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prêmios
CREATE POLICY "Campanha owners can view premios" ON public.premios_campanha
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = premios_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

CREATE POLICY "Campanha owners can create premios" ON public.premios_campanha
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = premios_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

CREATE POLICY "Campanha owners can update premios" ON public.premios_campanha
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = premios_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

CREATE POLICY "Campanha owners can delete premios" ON public.premios_campanha
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.campanhas 
      WHERE campanhas.id = premios_campanha.campanha_id 
      AND campanhas.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view premios" ON public.premios_campanha
  FOR SELECT USING (true);

-- Adicionar campo multiplicador_combo para campanhas
ALTER TABLE public.campanhas 
ADD COLUMN multiplicador_combo INTEGER DEFAULT 1;

-- Criar índices para melhor performance
CREATE INDEX idx_bilhetes_rifa_is_ganhador ON public.bilhetes_rifa(is_ganhador);
CREATE INDEX idx_bilhetes_campanha_is_ganhador ON public.bilhetes_campanha(is_ganhador);
CREATE INDEX idx_premios_campanha_campanha_id ON public.premios_campanha(campanha_id);
