-- =============================================
-- MIGRATION: Shopping List System
-- Descrição: Sistema completo de lista de compras com ingredientes e embalagens
-- =============================================

-- 1. TABELA: ingredients (Ingredientes cadastrados)
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('vegetais', 'frutas', 'carnes', 'proteínas', 'laticínios', 'grãos', 'temperos', 'outros')),
  base_unit VARCHAR(20) NOT NULL CHECK (base_unit IN ('g', 'ml', 'unidade')),
  is_weight BOOLEAN DEFAULT true,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- =============================================

-- 2. TABELA: ingredient_packages (Opções de embalagem)
CREATE TABLE IF NOT EXISTS ingredient_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_packages_ingredient ON ingredient_packages(ingredient_id);
CREATE INDEX idx_packages_default ON ingredient_packages(is_default);

-- =============================================

-- 3. TABELA: unit_conversions (Conversões de unidades)
CREATE TABLE IF NOT EXISTS unit_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_unit VARCHAR(50) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  ingredient_type VARCHAR(50),
  conversion_factor DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversões padrão
INSERT INTO unit_conversions (from_unit, to_unit, ingredient_type, conversion_factor) VALUES
('xícara', 'ml', 'líquido', 240),
('xícara', 'g', 'farinha', 120),
('xícara', 'g', 'arroz', 200),
('xícara', 'g', 'açúcar', 200),
('xícara', 'g', 'aveia', 80),
('colher de sopa', 'ml', 'líquido', 15),
('colher de sopa', 'g', 'açúcar', 12),
('colher de sopa', 'g', 'farinha', 8),
('colher de chá', 'ml', 'líquido', 5),
('colher de chá', 'g', 'sal', 5),
('copo', 'ml', 'líquido', 250),
('litro', 'ml', 'líquido', 1000),
('kg', 'g', NULL, 1000)
ON CONFLICT DO NOTHING;

-- =============================================

-- 4. TABELA: shopping_lists (Listas geradas)
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  name VARCHAR(200) DEFAULT 'Minha Lista',
  week_number INT,
  servings INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_status ON shopping_lists(status);

-- =============================================

-- 5. TABELA: shopping_list_items (Itens da lista)
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
  ingredient_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  emoji VARCHAR(10),

  -- Quantidade da receita
  recipe_quantity DECIMAL(10,2),
  recipe_unit VARCHAR(20),

  -- Quantidade calculada para comprar
  buy_quantity DECIMAL(10,2),
  buy_unit VARCHAR(20),
  buy_package VARCHAR(100),

  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  display_order INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_list_items_checked ON shopping_list_items(is_checked);
CREATE INDEX idx_list_items_category ON shopping_list_items(category);

-- =============================================

-- SEED: Ingredientes comuns com emojis
INSERT INTO ingredients (name, category, base_unit, is_weight, emoji) VALUES
-- Vegetais
('Brócolis', 'vegetais', 'unidade', false, '🥦'),
('Tomate', 'vegetais', 'g', true, '🍅'),
('Alface', 'vegetais', 'unidade', false, '🥬'),
('Cenoura', 'vegetais', 'g', true, '🥕'),
('Cebola', 'vegetais', 'g', true, '🧅'),
('Alho', 'vegetais', 'g', true, '🧄'),
('Batata doce', 'vegetais', 'g', true, '🍠'),
('Abobrinha', 'vegetais', 'g', true, '🥒'),
('Repolho', 'vegetais', 'unidade', false, '🥬'),

-- Proteínas
('Ovos', 'proteínas', 'unidade', false, '🥚'),
('Peito de frango', 'carnes', 'g', true, '🍗'),
('Carne moída', 'carnes', 'g', true, '🥩'),
('Peixe', 'carnes', 'g', true, '🐟'),
('Atum em lata', 'proteínas', 'unidade', false, '🥫'),

-- Laticínios
('Leite desnatado', 'laticínios', 'ml', true, '🥛'),
('Iogurte natural', 'laticínios', 'unidade', false, '🥛'),
('Queijo cottage', 'laticínios', 'g', true, '🧀'),
('Queijo minas', 'laticínios', 'g', true, '🧀'),

-- Grãos
('Arroz integral', 'grãos', 'g', true, '🍚'),
('Aveia', 'grãos', 'g', true, '🥣'),
('Quinoa', 'grãos', 'g', true, '🌾'),
('Macarrão integral', 'grãos', 'g', true, '🍝'),

-- Frutas
('Banana', 'frutas', 'unidade', false, '🍌'),
('Maçã', 'frutas', 'unidade', false, '🍎'),
('Morango', 'frutas', 'g', true, '🍓'),
('Abacate', 'frutas', 'unidade', false, '🥑'),

-- Temperos
('Sal', 'temperos', 'g', true, '🧂'),
('Azeite', 'temperos', 'ml', true, '🫒'),
('Limão', 'frutas', 'unidade', false, '🍋')
ON CONFLICT (name) DO NOTHING;

-- =============================================

-- SEED: Embalagens para ingredientes comuns

-- Ovos
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Ovos'), 'Meia dúzia (6 unidades)', 6, 'unidade', false, 2),
((SELECT id FROM ingredients WHERE name = 'Ovos'), 'Dúzia (12 unidades)', 12, 'unidade', true, 1),
((SELECT id FROM ingredients WHERE name = 'Ovos'), 'Bandeja com 30 unidades', 30, 'unidade', false, 3);

-- Leite
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Leite desnatado'), 'Caixa de 1L', 1000, 'ml', true, 1),
((SELECT id FROM ingredients WHERE name = 'Leite desnatado'), 'Garrafa de 900ml', 900, 'ml', false, 2);

-- Arroz
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Arroz integral'), 'Pacote de 500g', 500, 'g', false, 2),
((SELECT id FROM ingredients WHERE name = 'Arroz integral'), 'Pacote de 1kg', 1000, 'g', true, 1),
((SELECT id FROM ingredients WHERE name = 'Arroz integral'), 'Pacote de 5kg', 5000, 'g', false, 3);

-- Frango
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Peito de frango'), '1kg', 1000, 'g', true, 1),
((SELECT id FROM ingredients WHERE name = 'Peito de frango'), '500g', 500, 'g', false, 2);

-- Aveia
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Aveia'), 'Pacote de 500g', 500, 'g', true, 1),
((SELECT id FROM ingredients WHERE name = 'Aveia'), 'Pacote de 1kg', 1000, 'g', false, 2);

-- Iogurte
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Iogurte natural'), 'Pote de 170g', 1, 'unidade', true, 1),
((SELECT id FROM ingredients WHERE name = 'Iogurte natural'), 'Pote de 500g', 1, 'unidade', false, 2);

-- Repolho
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Repolho'), '1 unidade', 1, 'unidade', true, 1),
((SELECT id FROM ingredients WHERE name = 'Repolho'), '1/2 unidade', 0.5, 'unidade', false, 2);

-- Brócolis
INSERT INTO ingredient_packages (ingredient_id, package_name, quantity, unit, is_default, display_order) VALUES
((SELECT id FROM ingredients WHERE name = 'Brócolis'), '1 unidade', 1, 'unidade', true, 1),
((SELECT id FROM ingredients WHERE name = 'Brócolis'), '1 maço', 1, 'unidade', false, 2);

-- =============================================

-- RLS Policies

-- Shopping lists
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping lists"
  ON shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping lists"
  ON shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
  ON shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
  ON shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping list items
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own list items"
  ON shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own list items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own list items"
  ON shopping_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own list items"
  ON shopping_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Ingredients (público para leitura)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ingredients"
  ON ingredients FOR SELECT
  USING (true);

-- Ingredient packages (público para leitura)
ALTER TABLE ingredient_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages"
  ON ingredient_packages FOR SELECT
  USING (true);

-- Unit conversions (público para leitura)
ALTER TABLE unit_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view conversions"
  ON unit_conversions FOR SELECT
  USING (true);
