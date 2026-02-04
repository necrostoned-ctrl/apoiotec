const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function injectCleanup() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.log("❌ Arquivo routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    console.log("🧼 Preparando a faxina do banco de dados...");

    // 1. A FUNÇÃO DE LIMPEZA (Blindada)
    const cleanupFunction = `
async function runPreBackupCleanup() {
  console.log("🧹 [BACKUP-CLEANUP] Iniciando limpeza pré-backup...");
  try {
    // Limpa lixo de autenticação e sessões expiradas
    await db.execute(sql\`DELETE FROM "sessions" WHERE "expire" < NOW()\`);
    await db.execute(sql\`DELETE FROM "one_time_tokens"\`);
    await db.execute(sql\`DELETE FROM "refresh_tokens"\`);
    
    // Mantém apenas os últimos 30 dias de histórico para não inflar o backup
    await db.execute(sql\`DELETE FROM "history_events" WHERE "created_at" < NOW() - INTERVAL '30 days'\`);
    
    // Limpa logs de backup com mais de 7 dias
    await db.execute(sql\`DELETE FROM "backup_execution_logs" WHERE "created_at" < NOW() - INTERVAL '7 days'\`);

    // Compacta o banco fisicamente para o arquivo vir menor
    await db.execute(sql\`VACUUM ANALYZE\`);
    
    console.log("✅ [BACKUP-CLEANUP] Banco limpo e compactado!");
  } catch (error: any) {
    console.log("⚠️ [BACKUP-CLEANUP] Erro na limpeza (mas o backup seguirá):", error.message);
  }
}
`;

    // 2. Injeção da Função
    if (!content.includes('async function runPreBackupCleanup()')) {
        content = content.replace('export async function registerRoutes', cleanupFunction + '\nexport async function registerRoutes');
    }

    // 3. Injeção nas rotas de backup (Manual e Automático)
    // Procuro onde você gera o backup e insiro o 'await runPreBackupCleanup();'
    // Geralmente em rotas que contenham '/api/backup'
    const backupRouteRegex = /app\.(get|post)\("\/api\/backup\/.*?", async \(req, res\) => \{/g;
    
    if (backupRouteRegex.test(content)) {
        content = content.replace(backupRouteRegex, (match) => {
            return `${match}\n    await runPreBackupCleanup();`;
        });
        console.log("🎯 Chamada de limpeza inserida nas rotas de backup.");
    } else {
        console.log("⚠️ Não encontrei rotas de backup automáticas/manuais para injetar. Verifique o caminho da rota.");
    }

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("🚀 SUCESSO: Sistema de backup agora é autolimpante!");
}

injectCleanup();