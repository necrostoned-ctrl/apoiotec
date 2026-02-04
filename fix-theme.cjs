const fs = require('fs');
const path = require('path');

const THEME_CONFIG = {
  indexCss: 'client/src/index.css',
  tailwindConfig: 'tailwind.config.ts',
  srcDir: 'client/src'
};

// 1. Novo conteúdo para o index.css (Cores da Apoiotec unificadas)
const newIndexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%; /* Azul Apoiotec */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}`;

// 2. Função para percorrer e substituir cores hardcoded
function replaceHardcodedColors(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      replaceHardcodedColors(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Substitui azul comum por primary
      content = content.replace(/bg-blue-600/g, 'bg-primary');
      content = content.replace(/text-blue-600/g, 'text-primary');
      content = content.replace(/border-blue-600/g, 'border-primary');
      
      // Ajusta fundos de modais/cards para usarem a variável de background
      content = content.replace(/bg-white/g, 'bg-background');
      
      fs.writeFileSync(filePath, content);
    }
  });
}

// Execução
console.log("🚀 Iniciando cirurgia estética na Apoiotec...");

try {
  fs.writeFileSync(THEME_CONFIG.indexCss, newIndexCss);
  console.log("✅ index.css parametrizado.");
  
  replaceHardcodedColors(THEME_CONFIG.srcDir);
  console.log("✅ Cores hardcoded substituídas por variáveis semânticas.");
  
  console.log("\n✨ Pronto! Agora rode 'npm run dev' e verifique as modais.");
} catch (err) {
  console.error("❌ Erro durante a execução:", err.message);
}