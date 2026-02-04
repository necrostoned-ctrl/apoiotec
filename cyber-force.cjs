const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const CYBER_STYLE = `
/* --- APOIOTEC CYBER-FORCE START --- */
@layer base {
  :root, .dark {
    --background: 240 10% 2% !important;
    --foreground: 180 100% 50% !important; /* Texto Ciano */
    --card: 0 0% 0% !important;             /* Fundo Preto Puro */
    --card-foreground: 180 100% 50% !important;
    --popover: 0 0% 0% !important;
    --primary: 180 100% 50% !important;     /* Ciano Neon */
    --secondary: 297 100% 70% !important;   /* Roxo Neon */
    --accent: 75 100% 50% !important;       /* Lima Neon */
    --border: 180 100% 50% / 0.4 !important;
  }
}

/* Forçar visual em todos os elementos de card e inputs */
div[class*="bg-card"], div[class*="bg-background"], .card, .bg-white {
  background-color: #000000 !important;
  border: 1px solid #00ffff66 !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

/* Estilo para Filtros e Inputs (Alta Visibilidade) */
input, select, textarea {
  background-color: #0a0a0a !important;
  border-color: #ccff00 !important; /* Lima */
  color: #ccff00 !important;
}

/* Botões Neon */
button[class*="bg-primary"], .btn-primary {
  background: linear-gradient(90deg, #00ffff, #0088ff) !important;
  color: #000 !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
}
/* --- APOIOTEC CYBER-FORCE END --- */
`;

function forceCyber() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error("❌ Arquivo CSS não encontrado.");
    return;
  }

  let content = fs.readFileSync(CSS_PATH, 'utf8');

  // Remove qualquer rastro de temas anteriores
  if (content.includes('APOIOTEC')) {
    content = content.replace(/\/\* --- APOIOTEC-NEON-INICIO --- \*\/[\s\S]*?\/\* --- APOIOTEC-NEON-FIM --- \*\//g, "");
    content = content.replace(/\/\* --- APOIOTEC CYBER-FORCE START --- \*\/[\s\S]*?\/\* --- APOIOTEC CYBER-FORCE END --- \*\//g, "");
  }

  fs.writeFileSync(CSS_PATH, CYBER_STYLE + "\n" + content);
  console.log("🚀 [APOIOTEC] Protocolo Cyber-Force Executado!");
  console.log("🦾 O sistema agora está em Preto Absoluto e Ciano Neon.");
}

forceCyber();