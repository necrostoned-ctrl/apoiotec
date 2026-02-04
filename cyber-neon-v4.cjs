const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const NEON_THEME = `
/* --- APOIOTEC-NEON-V4-START --- */
@layer base {
  :root, .dark {
    --background: 0 0% 0% !important;   /* Fundo Geral Preto */
    --card: 0 0% 0% !important;         /* Fundo dos Cards Preto */
    --foreground: 210 40% 98%;
    --border: 180 100% 50% / 0.2;
  }
}

/* Forçar fundos pretos mas permitir bordas customizadas */
div[class*="bg-card"], .card, .bg-white {
  background-color: #000000 !important;
  color: #ffffff !important;
}

/* --- UTILITÁRIOS DE BORDAS NEON (O que você tinha perdido) --- */
.neon-border-cyan { border: 1px solid #00ffff !important; box-shadow: 0 0 10px #00ffff44 !important; }
.neon-border-purple { border: 1px solid #bc13fe !important; box-shadow: 0 0 10px #bc13fe44 !important; }
.neon-border-green { border: 1px solid #39ff14 !important; box-shadow: 0 0 10px #39ff1444 !important; }
.neon-border-yellow { border: 1px solid #ccff00 !important; box-shadow: 0 0 10px #ccff0044 !important; }
.neon-border-red { border: 1px solid #ff003c !important; box-shadow: 0 0 10px #ff003c44 !important; }

/* Filtros com Alta Visibilidade */
.filter-focus {
  border: 2px solid #ccff00 !important;
  background: #0a0a0a !important;
  color: #ccff00 !important;
  font-weight: bold;
}

/* Botões Modernos */
button[class*="bg-primary"] {
  background: linear-gradient(90deg, #00ffff, #bc13fe) !important;
  color: #000 !important;
  font-weight: bold !important;
  border: none !important;
}
/* --- APOIOTEC-NEON-V4-END --- */
`;

function applyV4() {
  if (!fs.existsSync(CSS_PATH)) return console.error("❌ CSS não encontrado.");

  let content = fs.readFileSync(CSS_PATH, 'utf8');

  // Limpa versões antigas do script (v1, v2, v3 e Force)
  content = content.replace(/\/\* --- APOIOTEC-NEON-INICIO --- \*\/[\s\S]*?\/\* --- APOIOTEC-NEON-FIM --- \*\//g, "");
  content = content.replace(/\/\* --- APOIOTEC-NEON-V4-START --- \*\/[\s\S]*?\/\* --- APOIOTEC-NEON-V4-END --- \*\//g, "");
  content = content.replace(/\/\* --- APOIOTEC CYBER-FORCE START --- \*\/[\s\S]*?\/\* --- APOIOTEC CYBER-FORCE END --- \*\//g, "");

  fs.writeFileSync(CSS_PATH, NEON_THEME + "\n" + content);
  console.log("🚀 [APOIOTEC] Tema v4 Aplicado! Fundo preto e bordas neon restauradas.");
}

applyV4();