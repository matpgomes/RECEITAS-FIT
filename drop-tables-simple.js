// Script simples para remover tabelas redundantes
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msdiusqprtqlyydxyccf.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_PGf0MoOON-XdqVZX5IbHnw_Aa7wFK6K'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SQL = `
-- Remover tabelas redundantes
DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages;
DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions;
DROP INDEX IF EXISTS idx_packages_ingredient;
DROP INDEX IF EXISTS idx_packages_default;
DROP TABLE IF EXISTS ingredient_packages CASCADE;
DROP TABLE IF EXISTS unit_conversions CASCADE;
`

async function run() {
  console.log('🗑️  Removendo tabelas redundantes...\n')

  try {
    // Tentar executar cada comando separadamente
    const commands = [
      'DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages',
      'DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions',
      'DROP INDEX IF EXISTS idx_packages_ingredient',
      'DROP INDEX IF EXISTS idx_packages_default',
      'DROP TABLE IF EXISTS ingredient_packages CASCADE',
      'DROP TABLE IF EXISTS unit_conversions CASCADE'
    ]

    for (const cmd of commands) {
      console.log(`Executando: ${cmd.substring(0, 50)}...`)
      // Supabase SDK não suporta DDL diretamente
    }

    console.log('\n⚠️  O SDK do Supabase não suporta comandos DDL (DROP TABLE)\n')
    console.log('📝 EXECUTE ESTE SQL MANUALMENTE NO SUPABASE:\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(SQL)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📍 Como executar:')
    console.log('   1. Acesse: https://supabase.com/dashboard')
    console.log('   2. Selecione o projeto: msdiusqprtqlyydxyccf')
    console.log('   3. Vá em: SQL Editor (ícone </> no menu lateral)')
    console.log('   4. Clique em: New Query')
    console.log('   5. Cole o SQL acima')
    console.log('   6. Clique em: Run (ou Ctrl+Enter)\n')
    console.log('✅ Após executar, as tabelas serão removidas!\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

run()
