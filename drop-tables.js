// Script para remover tabelas redundantes do Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function dropRedundantTables() {
  console.log('🗑️  Removendo tabelas redundantes...\n')

  try {
    // 1. Dropar policies RLS
    console.log('1️⃣  Removendo RLS policies...')

    const dropPolicies = `
      DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages;
      DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions;
    `

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: dropPolicies })

    if (policiesError && !policiesError.message.includes('does not exist')) {
      console.log('⚠️  Aviso ao remover policies:', policiesError.message)
    } else {
      console.log('✅ Policies removidas\n')
    }

    // 2. Dropar índices
    console.log('2️⃣  Removendo índices...')

    const dropIndexes = `
      DROP INDEX IF EXISTS idx_packages_ingredient;
      DROP INDEX IF EXISTS idx_packages_default;
    `

    const { error: indexesError } = await supabase.rpc('exec_sql', { sql: dropIndexes })

    if (indexesError && !indexesError.message.includes('does not exist')) {
      console.log('⚠️  Aviso ao remover índices:', indexesError.message)
    } else {
      console.log('✅ Índices removidos\n')
    }

    // 3. Dropar tabelas
    console.log('3️⃣  Removendo tabelas...')

    const dropTables = `
      DROP TABLE IF EXISTS ingredient_packages CASCADE;
      DROP TABLE IF EXISTS unit_conversions CASCADE;
    `

    const { error: tablesError } = await supabase.rpc('exec_sql', { sql: dropTables })

    if (tablesError) {
      throw tablesError
    }

    console.log('✅ Tabelas removidas com sucesso!\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✨ CONCLUÍDO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Tabelas removidas:')
    console.log('  ❌ ingredient_packages')
    console.log('  ❌ unit_conversions\n')
    console.log('Motivo: A IA (Claude via N8N) já faz essas')
    console.log('conversões e sugestões de embalagens.\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)

    // Tentar método alternativo - executar SQL direto
    console.log('\n⚠️  Tentando método alternativo...\n')

    try {
      const sql = `
        DROP POLICY IF EXISTS "Anyone can view packages" ON ingredient_packages;
        DROP POLICY IF EXISTS "Anyone can view conversions" ON unit_conversions;
        DROP INDEX IF EXISTS idx_packages_ingredient;
        DROP INDEX IF EXISTS idx_packages_default;
        DROP TABLE IF EXISTS ingredient_packages CASCADE;
        DROP TABLE IF EXISTS unit_conversions CASCADE;
      `

      const { error } = await supabase.from('_migrations').select('*').limit(1)

      console.log('📝 EXECUTE ESTE SQL MANUALMENTE NO SUPABASE:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      console.log(sql)
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n📍 Acesse: https://supabase.com/dashboard')
      console.log('   → Seu projeto')
      console.log('   → SQL Editor')
      console.log('   → Cole e execute o SQL acima\n')

    } catch (fallbackError) {
      console.error('❌ Erro no método alternativo:', fallbackError.message)
    }
  }
}

dropRedundantTables()
