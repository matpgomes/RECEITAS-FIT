const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://msdiusqprtqlyydxyccf.supabase.co',
  'sb_secret_PGf0MoOON-XdqVZX5IbHnw_Aa7wFK6K'
)

async function createDraftTable() {
  console.log('🔨 Criando tabela draft_shopping_list_items...\n')

  try {
    // Criar tabela via query RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS draft_shopping_list_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          ingredient_name VARCHAR(200) NOT NULL,
          quantity VARCHAR(50) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
          recipe_name VARCHAR(200),
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_draft_items_user ON draft_shopping_list_items(user_id);
        CREATE INDEX IF NOT EXISTS idx_draft_items_recipe ON draft_shopping_list_items(recipe_id);

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

        DROP TRIGGER IF EXISTS update_draft_items_updated_at ON draft_shopping_list_items;
        CREATE TRIGGER update_draft_items_updated_at
          BEFORE UPDATE ON draft_shopping_list_items
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    })

    if (error) throw error

    console.log('✅ Tabela draft_shopping_list_items criada com sucesso!\n')

    // Verificar se tabela foi criada
    const { data: tables, error: listError } = await supabase
      .from('draft_shopping_list_items')
      .select('*')
      .limit(0)

    if (listError) {
      if (listError.code === 'PGRST116') {
        console.log('⚠️  Tabela criada mas ainda não está visível pelo RLS')
      } else {
        console.log('⚠️  Erro ao verificar tabela:', listError.message)
      }
    } else {
      console.log('✅ Tabela verificada e acessível!')
    }

    console.log('\n📊 Estrutura criada:')
    console.log('  - draft_shopping_list_items (tabela)')
    console.log('  - idx_draft_items_user (índice)')
    console.log('  - idx_draft_items_recipe (índice)')
    console.log('  - 4 RLS policies criadas')
    console.log('  - Trigger updated_at ativado\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)

    console.log('\n📝 Execute este SQL manualmente no Supabase:\n')
    console.log('https://supabase.com/dashboard/project/msdiusqprtqlyydxyccf/sql/new\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`
CREATE TABLE IF NOT EXISTS draft_shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(200) NOT NULL,
  quantity VARCHAR(50) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  recipe_name VARCHAR(200),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draft_items_user ON draft_shopping_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_items_recipe ON draft_shopping_list_items(recipe_id);

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

DROP TRIGGER IF EXISTS update_draft_items_updated_at ON draft_shopping_list_items;
CREATE TRIGGER update_draft_items_updated_at
  BEFORE UPDATE ON draft_shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

createDraftTable()
