const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function fixQuoting() {
    console.log("🛠️ Corrigindo comandos de shell para suportar espaços em pastas...");

    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("❌ Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Corrigir o pg_dump (Geração de Backup)
    // De: > ${backupPath}  Para: > "${backupPath}"
    content = content.replace(/> \${backupPath}/g, '> "\${backupPath}"');

    // 2. Corrigir o psql (Restauração de Backup)
    // De: < ${backupPath}  Para: < "${backupPath}"
    content = content.replace(/< \${backupPath}/g, '< "\${backupPath}"');

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ server/routes.ts atualizado: caminhos agora estão entre aspas.");
}

fixQuoting();