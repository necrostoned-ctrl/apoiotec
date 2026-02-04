const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'calls.tsx');

function findModal() {
    if (!fs.existsSync(FILE_PATH)) {
        console.log("❌ Arquivo calls.tsx não encontrado.");
        return;
    }

    const content = fs.readFileSync(FILE_PATH, 'utf8');
    const lines = content.split('\n');
    
    console.log("--- 🕵️ BUSCANDO O BOTÃO E O MODAL ---");
    lines.forEach((line, index) => {
        if (line.includes('Novo Chamado')) {
            console.log(`\n📍 Botão encontrado na Linha ${index + 1}:`);
            // Mostra 10 linhas antes e 40 depois para achar o modal
            for (let i = Math.max(0, index - 5); i < Math.min(lines.length, index + 40); i++) {
                console.log(`${i + 1}: ${lines[i]}`);
            }
        }
    });
}

findModal();   