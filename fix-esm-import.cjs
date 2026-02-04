const fs = require('fs');
const path = require('path');

const ROUTES_PATH = path.join(process.cwd(), 'server', 'routes.ts');

function fixEsmImport() {
    if (!fs.existsSync(ROUTES_PATH)) {
        console.error("Arquivo server/routes.ts não encontrado.");
        return;
    }

    let content = fs.readFileSync(ROUTES_PATH, 'utf8');

    // 1. Adiciona a importação correta no topo do arquivo, se ainda não existir
    if (!content.includes('import { execSync } from "child_process"')) {
        content = 'import { execSync } from "child_process";\n' + content;
    }

    // 2. Remove a linha de 'require' que causa o erro dentro da rota
    // Procura por variações de aspas simples ou duplas
    const requireRegex = /const\s+\{\s*execSync\s*\}\s*=\s*require\(['"]child_process['"]\);?/g;
    
    if (requireRegex.test(content)) {
        content = content.replace(requireRegex, '');
        console.log("✅ Referência ao 'require' removida.");
    }

    fs.writeFileSync(ROUTES_PATH, content);
    console.log("✅ Importação de 'execSync' movida para o topo (padrão ESM).");
}

fixEsmImport();