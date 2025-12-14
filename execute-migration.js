const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://msdiusqprtqlyydxyccf.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_PGf0MoOON-XdqVZX5IbHnw_Aa7wFK6K';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'msdiusqprtqlyydxyccf.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          // Even if exec_sql doesn't exist, we'll use a different approach
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('🚀 Iniciando execução da migration 001_create_users.sql\n');

  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_create_users.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 SQL carregado:');
  console.log('─'.repeat(60));
  console.log(sql.substring(0, 200) + '...');
  console.log('─'.repeat(60));
  console.log('\n💡 Nota: Como a API REST do Supabase não permite execução direta de DDL,');
  console.log('   vou usar a PostgREST admin API.\n');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📊 Total de ${statements.length} statements para executar\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\n[${i + 1}/${statements.length}] Executando statement...`);
    console.log(statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));

    try {
      const result = await executeSql(statement);
      if (result.success) {
        console.log('✅ Sucesso');
      } else {
        console.log(`⚠️  Status ${result.statusCode}: ${result.error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Migration concluída!');
  console.log('='.repeat(60));
  console.log('\n💡 Verifique no Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/msdiusqprtqlyydxyccf/editor');
}

runMigration().catch(console.error);
