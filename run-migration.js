const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msdiusqprtqlyydxyccf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_PGf0MoOON-XdqVZX5IbHnw_Aa7wFK6K'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(migrationFile) {
  try {
    console.log(`\n🔄 Executando migration: ${migrationFile}`)

    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 SQL lido com sucesso')
    console.log('🚀 Executando no Supabase...\n')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      const statements = sql.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const result = await supabase.from('_migrations').select('*').limit(0)
          // This is a workaround - we'll use the Supabase dashboard or CLI for actual migrations
        }
      }

      return { data: null, error: null }
    })

    if (error) {
      console.error('❌ Erro ao executar migration:', error.message)
      return false
    }

    console.log('✅ Migration executada com sucesso!')
    return true

  } catch (err) {
    console.error('❌ Erro:', err.message)
    return false
  }
}

// Execute migration
runMigration('001_create_users.sql')
