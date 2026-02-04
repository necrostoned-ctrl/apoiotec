const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function fixSyntax() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error("❌ Arquivo não encontrado.");
        return;
    }

    let content = fs.readFileSync(FILE_PATH, 'utf8');

    // O script de limpeza deixou isso:
    // {(actionType === "service" || actionType === "invoice") && (
    // )}
    
    const brokenPattern = /\{\(actionType === "service" \|\| actionType === "invoice"\) && \(\s*\)\}/g;

    if (brokenPattern.test(content)) {
        content = content.replace(brokenPattern, '');
        fs.writeFileSync(FILE_PATH, content);
        console.log("✅ Sucesso: O erro de sintaxe na linha 982 foi corrigido!");
    } else {
        // Tenta uma busca mais genérica se a primeira falhar
        const fallbackPattern = /\(actionType === "service" \|\| actionType === "invoice"\) && \(\s*\)/g;
        if (fallbackPattern.test(content)) {
            content = content.replace(fallbackPattern, 'false'); // Desativa a condição vazia
            fs.writeFileSync(FILE_PATH, content);
            console.log("✅ Sucesso: Sintaxe corrigida com fallback!");
        } else {
            console.log("❌ Não encontrei o padrão quebrado. Talvez a linha seja um pouco diferente.");
        }
    }
}

fixSyntax();