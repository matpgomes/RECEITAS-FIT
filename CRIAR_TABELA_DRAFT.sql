-- =============================================
-- 📝 TABELA DRAFT (LISTA TEMPORÁRIA)
-- =============================================
--
-- FLUXO COMPLETO:
--
-- 1. DRAFT (Antes de gerar com IA)
--    ↓ Usuário adiciona ingredientes de receitas
--    ↓ Usuário edita manualmente (adiciona/remove/ajusta)
--    ├── Salvo em: draft_shopping_list_items
--    └── Uma draft por usuário (sempre sobrescreve)
--
-- 2. GERAR COM IA
--    ↓ Clica em "Gerar Lista"
--    ↓ Envia draft_items para N8N
--    ↓ N8N processa com Claude
--    ├── Converte unidades
--    ├── Consolida ingredientes
--    └── Sugere embalagens
--
-- 3. LISTA FINAL (Depois da IA processar)
--    ↓ N8N retorna lista consolidada
--    ↓ Cria shopping_list (nova lista)
--    ├── Salva em: shopping_list_items
--    ├── Usuário marca como comprado (is_checked)
--    └── Não edita mais, só marca check
--
-- =============================================

-- TABELA: draft_shopping_list_items
-- Propósito: Armazenar ingredientes ANTES de gerar com IA
CREATE TABLE IF NOT EXISTS draft_shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do ingrediente (vem das receitas ou manual)
  ingredient_name VARCHAR(200) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,  -- de onde veio
  recipe_name VARCHAR(200),  -- nome da receita (pra mostrar)

  -- Controle
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_draft_items_user ON draft_shopping_list_items(user_id);
CREATE INDEX idx_draft_items_recipe ON draft_shopping_list_items(recipe_id);

-- RLS Policies
ALTER TABLE draft_shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own draft items"
  ON draft_shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own draft items"
  ON draft_shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft items"
  ON draft_shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft items"
  ON draft_shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_draft_items_updated_at
  BEFORE UPDATE ON draft_shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTÁRIOS EXPLICATIVOS
-- =============================================

COMMENT ON TABLE draft_shopping_list_items IS
'Lista temporária de ingredientes ANTES de processar com IA. Cada usuário tem UMA draft que é editável.';

COMMENT ON COLUMN draft_shopping_list_items.ingredient_name IS
'Nome do ingrediente como está na receita (ex: "Peito de frango")';

COMMENT ON COLUMN draft_shopping_list_items.quantity IS
'Quantidade como está na receita (ex: "200", "2", "1 xícara")';

COMMENT ON COLUMN draft_shopping_list_items.unit IS
'Unidade como está na receita (ex: "g", "unidades", "xícara")';

COMMENT ON COLUMN draft_shopping_list_items.recipe_id IS
'ID da receita de onde veio este ingrediente (null se adicionado manualmente)';

-- =============================================
-- ✅ RESULTADO FINAL
-- =============================================
--
-- ESTRUTURA COMPLETA:
--
-- draft_shopping_list_items (TEMPORÁRIA - antes da IA)
--   ├── id
--   ├── user_id
--   ├── ingredient_name
--   ├── quantity
--   ├── unit
--   ├── recipe_id (de onde veio)
--   ├── recipe_name
--   ├── display_order
--   ├── created_at
--   └── updated_at
--
-- shopping_lists (DEFINITIVA - depois da IA)
--   ├── id
--   ├── user_id
--   ├── name
--   ├── status
--   ├── created_at
--   └── updated_at
--
-- shopping_list_items (DEFINITIVA - depois da IA)
--   ├── id
--   ├── shopping_list_id
--   ├── product_name (processado pela IA)
--   ├── quantity (processado pela IA)
--   ├── unit (processado pela IA)
--   ├── category (adicionado pela IA)
--   ├── is_checked (usuário marca)
--   ├── notes
--   ├── display_order
--   ├── created_at
--   └── updated_at
--
-- =============================================
