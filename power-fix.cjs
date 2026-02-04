const fs = require('fs');
const path = require('path');

const PATHS = {
  indexCss: 'client/src/index.css',
  tailwindConfig: 'tailwind.config.ts',
  srcDir: 'client/src'
};

// 1. Configuração de Cores Sólidas (Garante visibilidade total)
const fullIndexCss = `@tailwind base;
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
  * { border-color: hsl(var(--border)); }
  body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
}`;

// 2. Garantir que o Tailwind entenda o formato HSL
const tailwindPatch = `
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },`;

function applyPowerFix() {
  console.log("🛠️ Iniciando recuperação potente da Apoiotec...");

  // Ajusta o CSS
  fs.writeFileSync(PATHS.indexCss, fullIndexCss);
  console.log("✅ CSS Base restaurado.");

  // Ajusta o Tailwind Config (Injeta as definições de HSL se faltarem)
  if (fs.existsSync(PATHS.tailwindConfig)) {
    let twContent = fs.readFileSync(PATHS.tailwindConfig, 'utf8');
    if (!twContent.includes('hsl(var(--background))')) {
      twContent = twContent.replace(/colors:\s*{/, `colors: {${tailwindPatch}`);
      fs.writeFileSync(PATHS.tailwindConfig, twContent);
      console.log("✅ Tailwind Config atualizado para suporte HSL.");
    }
  }

  // Limpeza de transparências indesejadas nos componentes
  const fixComponents = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) fixComponents(filePath);
      else if (file.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Se algo sumiu, pode ser que o bg-white tenha virado bg-background sem definição
        // Vamos forçar a volta de backgrounds sólidos onde for crítico
        content = content.replace(/className="transparent"/g, 'className="bg-background"');
        fs.writeFileSync(filePath, content);
      }
    });
  };
  fixComponents(PATHS.srcDir);
  console.log("✨ Sistema visível novamente! Rode 'npm run dev'.");
}

applyPowerFix();