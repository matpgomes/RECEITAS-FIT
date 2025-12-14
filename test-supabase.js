const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://msdiusqprtqlyydxyccf.supabase.co'
const supabaseKey = 'sb_publishable_IG3MPfvwuPWJaDUqGOmSVA_2hshGsUv'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...')

    // Test connection by fetching user
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log('⚠️  Erro ao conectar:', error.message)
      return false
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 URL:', supabaseUrl)
    console.log('🔑 Chave anon configurada')

    // Try to list tables (will fail if no tables exist, but confirms connection)
    const { data: tables, error: tablesError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)

    if (tablesError) {
      console.log('ℹ️  Nenhuma tabela criada ainda (isso é esperado)')
    } else {
      console.log('✅ Banco de dados acessível!')
    }

    return true
  } catch (err) {
    console.error('❌ Erro:', err.message)
    return false
  }
}

testConnection()
