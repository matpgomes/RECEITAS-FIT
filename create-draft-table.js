// Script para criar tabela draft usando Supabase
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msdiusqprtqlyydxyccf.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_PGf0MoOON-XdqVZX5IbHnw_Aa7wFK6K'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function createDraftTable() {
  console.log('📝 Criando tabela draft_shopping_list_items...\n')

  const sql = `
-- TABELA DRAFT (lista temporária editável)
CREATE TABLE IF NOT EXISTS draft_shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dados do ingrediente (vem das receitas ou manual)
  ingredient_name VARCHAR(200) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  recipe_name VARCHAR(200),

  -- Controle
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_draft_items_user ON draft_shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_items_recipe ON draft_shopping_list_items(recipe_id);

-- RLS Policies
ALTER TABLE draft_shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own draft items" ON draft_shopping_list_items;
CREATE POLICY "Users can view own draft items"
  ON draft_shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own draft items" ON draft_shopping_list_items;
CREATE POLICY "Users can create own draft items"
  ON draft_shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own draft items" ON draft_shopping_list_items;
CREATE POLICY "Users can update own draft items"
  ON draft_shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own draft items" ON draft_shopping_list_items;
CREATE POLICY "Users can delete own draft items"
  ON draft_shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_draft_items_updated_at ON draft_shopping_list_items;
CREATE TRIGGER update_draft_items_updated_at
  BEFORE UPDATE ON draft_shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`

  console.log('⚠️  O SDK do Supabase não suporta comandos DDL diretamente.\n')
  console.log('📝 EXECUTE ESTE SQL NO SUPABASE SQL EDITOR:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(sql)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📍 Como executar:')
  console.log('   1. Acesse: https://supabase.com/dashboard/project/msdiusqprtqlyydxyccf/sql/new')
  console.log('   2. Cole o SQL acima')
  console.log('   3. Clique em: Run (ou Ctrl+Enter)\n')
  console.log('✅ Após executar, a tabela draft_shopping_list_items será criada!\n')

  console.log('📊 ESTRUTURA DA DRAFT:\n')
  console.log('draft_shopping_list_items (temporária, editável)')
  console.log('  ├── id (UUID)')
  console.log('  ├── user_id (quem criou)')
  console.log('  ├── ingredient_name (ex: "Frango")')
  console.log('  ├── quantity (ex: "500")')
  console.log('  ├── unit (ex: "g")')
  console.log('  ├── recipe_id (de onde veio)')
  console.log('  ├── recipe_name (nome da receita)')
  console.log('  └── display_order\n')

  console.log('💡 FLUXO:')
  console.log('  1. Usuário adiciona receitas → draft_shopping_list_items')
  console.log('  2. Usuário edita manualmente → draft_shopping_list_items')
  console.log('  3. Clica "Gerar com IA" → Envia draft para N8N')
  console.log('  4. N8N processa → Retorna lista consolidada')
  console.log('  5. Lista final salva em → shopping_list_items')
  console.log('  6. Usuário marca itens comprados → is_checked\n')
}

createDraftTable()
