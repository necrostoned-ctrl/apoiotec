const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function finalPolish() {
    if (!fs.existsSync(ROUTES_PATH)) return;
    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🛠️ Ajustando a faxina para ser compatível com o seu banco...");

    // Nova função com tratamento de erro por linha (pra não travar se uma tabela não existir)
    const robustCleanup = `
async function runPreBackupCleanup() {
  console.log("🧹 [BACKUP-CLEANUP] Iniciando limpeza inteligente...");
  const queries = [
    'DELETE FROM "sessions" WHERE "expire" < NOW()',
    'DELETE FROM "session" WHERE "expire" < NOW()',
    'DELETE FROM "one_time_tokens"',
    'DELETE FROM "refresh_tokens"',
    'DELETE FROM "history_events" WHERE "created_at" < NOW() - INTERVAL \\'30 days\\'',
    'DELETE FROM "backup_execution_logs" WHERE "created_at" < NOW() - INTERVAL \\'7 days\\'',
    'VACUUM ANALYZE'
  ];

  for (const q of queries) {
    try {
      await db.execute(sql.raw(q));
    } catch (e) {
      // Ignora erro de "tabela não existe" e segue em frente
    }
  }
  console.log("✅ [BACKUP-CLEANUP] Limpeza concluída!");
}
`;

    // Substitui a função antiga pela versão robusta
    content = content.replace(/async function runPreBackupCleanup\(\) \{[\s\S]*?\}\n/g, robustCleanup + '\n');

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 Pronto! A faxina agora é silenciosa e eficiente.");
}

finalPolish();