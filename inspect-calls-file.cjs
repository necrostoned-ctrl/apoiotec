const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function inspectCalls() {
    if (!fs.existsSync(FILE_PATH)) {
        console.log("❌ Arquivo não encontrado.");
        return;
    }

    const content = fs.readFileSync(FILE_PATH, 'utf8');
    
    console.log("--- 🕵️ INVESTIGAÇÃO CALLS.TSX ---");
    
    // 1. Procura por imports de componentes de formulário
    const imports = content.match(/import .* from ["']\.\.\/components\/.*["']/g);
    if (imports) {
        console.log("\n📦 Componentes importados:");
        imports.forEach(i => console.log(i));
    }

    // 2. Procura pelo Dialog ou Modal
    if (content.includes('DialogContent') || content.includes('Modal')) {
        console.log("\n✅ O formulário parece estar escrito DIRETAMENTE dentro da calls.tsx.");
    } else {
        console.log("\n🔍 O formulário deve ser um componente externo.");
    }
}

inspectCalls();