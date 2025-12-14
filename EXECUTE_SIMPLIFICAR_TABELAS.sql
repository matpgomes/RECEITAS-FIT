-- =============================================
-- 🎯 SIMPLIFICAR TABELAS DE LISTA DE COMPRAS
-- =============================================
--
-- MOTIVO: A IA (N8N + Claude) já retorna a lista PRONTA
-- com todos os dados necessários:
--   {
--     "product_name": "Azeite de oliva",
--     "purchase_quantity": "500",
--     "unit": "ml",
--     "category": "outros"
--   }
--
-- Não precisamos de:
--   ❌ ingredient_id (referência aos ingredientes)
--   ❌ recipe_quantity/recipe_unit (quantidade da receita)
--   ❌ buy_quantity/buy_unit separados
--   ❌ buy_package (embalagem)
--   ❌ emoji (não usamos)
--   ❌ tabela ingredients (não precisamos mais)
--
-- O cliente só precisa:
--   ✅ product_name (nome do produto)
--   ✅ quantity (quantidade para comprar)
--   ✅ unit (unidade: ml, g, kg, unidades)
--   ✅ category (categoria)
--   ✅ is_checked (marcado como comprado?)
--
-- =============================================

-- 1️⃣ DROPAR TABELAS E DEPENDÊNCIAS ANTIGAS
-- =============================================

-- Dropar constraints e índices de shopping_list_items
DROP INDEX IF EXISTS idx_list_items_list;
DROP INDEX IF EXISTS idx_list_items_checked;
DROP INDEX IF EXISTS idx_list_items_category;

-- Dropar tabela de itens antiga (CASCADE para limpar policies)
DROP TABLE IF EXISTS shopping_list_items CASCADE;

-- Dropar tabela ingredients (não é mais necessária)
DROP POLICY IF EXISTS "Anyone can view ingredients" ON ingredients;
DROP INDEX IF EXISTS idx_ingredients_name;
DROP INDEX IF EXISTS idx_ingredients_category;
DROP TABLE IF EXISTS ingredients CASCADE;

-- =============================================
-- 2️⃣ SIMPLIFICAR shopping_lists
-- =============================================

-- Remover colunas desnecessárias de shopping_lists
ALTER TABLE shopping_lists
  DROP COLUMN IF EXISTS recipe_id,
  DROP COLUMN IF EXISTS week_number,
  DROP COLUMN IF EXISTS servings;

-- Garantir que tem as colunas necessárias
ALTER TABLE shopping_lists
  ADD COLUMN IF NOT EXISTS name VARCHAR(200) DEFAULT 'Minha Lista',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'));

-- =============================================
-- 3️⃣ CRIAR NOVA TABELA shopping_list_items (SIMPLIFICADA)
-- =============================================

CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,

  -- Dados que vêm da IA (mapeamento direto do JSON do N8N)
  product_name VARCHAR(200) NOT NULL,
  quantity VARCHAR(50) NOT NULL,  -- Ex: "500", "2", "1"
  unit VARCHAR(50) NOT NULL,      -- Ex: "ml", "g", "kg", "unidades"
  category VARCHAR(100),           -- Ex: "vegetais", "carnes", "outros"

  -- Controle do usuário
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,

  -- Ordem de exibição
  display_order INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_list_items_checked ON shopping_list_items(is_checked);
CREATE INDEX idx_list_items_category ON shopping_list_items(category);

-- =============================================
-- 4️⃣ RECRIAR RLS POLICIES
-- =============================================

-- Habilitar RLS
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Users podem ver seus próprios itens
CREATE POLICY "Users can view own list items"
  ON shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Users podem criar itens nas suas listas
CREATE POLICY "Users can create own list items"
  ON shopping_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Users podem atualizar seus itens (marcar como checked)
CREATE POLICY "Users can update own list items"
  ON shopping_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Users podem deletar seus itens
CREATE POLICY "Users can delete own list items"
  ON shopping_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- =============================================
-- 5️⃣ FUNÇÃO PARA ATUALIZAR updated_at
-- =============================================

-- Criar função de trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger
DROP TRIGGER IF EXISTS update_shopping_list_items_updated_at ON shopping_list_items;
CREATE TRIGGER update_shopping_list_items_updated_at
    BEFORE UPDATE ON shopping_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ✅ COMENTÁRIOS EXPLICATIVOS
-- =============================================

COMMENT ON TABLE shopping_list_items IS
'Itens da lista de compras gerados pela IA. Campos mapeiam diretamente o JSON retornado pelo N8N/Claude.';

COMMENT ON COLUMN shopping_list_items.product_name IS
'Nome do produto (vem do campo "product_name" do N8N)';

COMMENT ON COLUMN shopping_list_items.quantity IS
'Quantidade para comprar (vem do campo "purchase_quantity" do N8N)';

COMMENT ON COLUMN shopping_list_items.unit IS
'Unidade de medida: ml, g, kg, unidades, etc (vem do campo "unit" do N8N)';

COMMENT ON COLUMN shopping_list_items.category IS
'Categoria do produto: vegetais, carnes, laticínios, outros (vem do campo "category" do N8N)';

-- =============================================
-- 🎉 CONCLUÍDO!
-- =============================================
--
-- Estrutura final:
--
-- shopping_lists
--   ├── id
--   ├── user_id
--   ├── name
--   ├── status (active/completed/archived)
--   ├── created_at
--   └── updated_at
--
-- shopping_list_items
--   ├── id
--   ├── shopping_list_id
--   ├── product_name     ← do N8N
--   ├── quantity         ← do N8N
--   ├── unit            ← do N8N
--   ├── category        ← do N8N
--   ├── is_checked      ← usuário marca
--   ├── notes           ← usuário adiciona
--   ├── display_order
--   ├── created_at
--   └── updated_at
--
-- =============================================
