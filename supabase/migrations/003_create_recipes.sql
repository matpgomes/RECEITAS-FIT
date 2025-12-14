-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Informações básicas
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,

  -- Métricas
  prep_time_minutes INTEGER NOT NULL CHECK (prep_time_minutes > 0),
  serves_people INTEGER NOT NULL DEFAULT 4 CHECK (serves_people > 0),

  -- Calorias
  calories_normal INTEGER NOT NULL CHECK (calories_normal > 0),
  calories_fit INTEGER NOT NULL CHECK (calories_fit > 0),
  calories_saved INTEGER GENERATED ALWAYS AS (calories_normal - calories_fit) STORED,

  -- Conteúdo (armazenado como JSONB)
  ingredients JSONB NOT NULL,
  preparation_full TEXT NOT NULL,
  preparation_steps JSONB NOT NULL,

  -- Categoria/Tags
  category TEXT,
  tags TEXT[],

  -- Restrições alimentares
  allergens TEXT[],

  -- Admin
  is_active BOOLEAN DEFAULT TRUE,
  featured_date DATE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recipes_featured_date ON public.recipes(featured_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON public.recipes(is_active);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_recipes_updated_at ON public.recipes;
CREATE TRIGGER trigger_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Public can view active recipes
CREATE POLICY "Anyone can view active recipes" ON public.recipes
  FOR SELECT USING (is_active = TRUE);

-- Only admins can insert/update/delete recipes (será implementado na Fase de Admin)
-- Por enquanto, desabilitando para permitir seed
CREATE POLICY "Allow insert for testing" ON public.recipes
  FOR INSERT WITH CHECK (true);
