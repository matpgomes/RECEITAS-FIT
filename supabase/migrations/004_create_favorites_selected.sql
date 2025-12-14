-- User Favorite Recipes table
CREATE TABLE IF NOT EXISTS public.user_favorite_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint para evitar duplicatas
  UNIQUE(user_id, recipe_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON public.user_favorite_recipes(recipe_id);

-- User Selected Recipes (calendar) table
CREATE TABLE IF NOT EXISTS public.user_selected_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  selected_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Um usuário pode ter apenas uma receita por dia
  UNIQUE(user_id, selected_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_selected_user_id ON public.user_selected_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_selected_recipe_id ON public.user_selected_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_selected_date ON public.user_selected_recipes(selected_date);

-- RLS Policies for Favorites
ALTER TABLE public.user_favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.user_favorite_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorite_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorite_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Selected Recipes
ALTER TABLE public.user_selected_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own selected recipes" ON public.user_selected_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selected recipes" ON public.user_selected_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own selected recipes" ON public.user_selected_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selected recipes" ON public.user_selected_recipes
  FOR DELETE USING (auth.uid() = user_id);
