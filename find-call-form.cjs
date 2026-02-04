const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    let foundFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            foundFiles = foundFiles.concat(searchFiles(fullPath));
        } else if (file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Procura por arquivos que tenham "clientId" e a palavra "Chamado"
            if (content.includes('clientId') && (content.includes('Novo Chamado') || content.includes('Criar Chamado'))) {
                foundFiles.push(fullPath);
            }
        }
    }
    return foundFiles;
}

console.log("🔍 Vasculhando arquivos do sistema...");
const targets = searchFiles(path.join(process.cwd(), 'client', 'src'));

if (targets.length > 0) {
    console.log("\n🎯 Possíveis arquivos do formulário:");
    targets.forEach((t, i) => console.log(`${i + 1}: ${t}`));
    console.log("\nMe diga qual desses números parece ser o formulário de criação.");
} else {
    console.log("❌ Não encontrei nada com esses termos.");
}