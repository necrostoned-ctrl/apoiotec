const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const BLACKOUT_THEME = `
/* --- APOIOTEC-BLACKOUT-START --- */
@layer base {
  :root, .dark {
    --background: 0 0% 0% !important;   /* Fundo da Tela Preto */
    --card: 0 0% 0% !important;         /* Fundo do Card Preto */
    --popover: 0 0% 0% !important;
    --muted: 240 10% 10% !important;    /* Cinza bem escuro para itens secundários */
  }

  body, html, #root, main {
    background-color: #000000 !important;
  }
}

/* Forçar fundo preto em qualquer elemento que se comporte como card ou painel */
div[class*="bg-card"], 
div[class*="bg-background"], 
.card, 
.bg-white,
section {
  background-color: #000000 !important;
  /* NÃO mexemos na borda aqui para não perder suas cores */
}

/* --- CLASSES DE BORDAS NEON QUE VOCÊ JÁ TEM --- */
.neon-border-cyan { border: 1px solid #00ffff !important; box-shadow: 0 0 8px #00ffff33 !important; }
.neon-border-purple { border: 1px solid #bc13fe !important; box-shadow: 0 0 8px #bc13fe33 !important; }
.neon-border-green { border: 1px solid #39ff14 !important; box-shadow: 0 0 8px #39ff1433 !important; }
.neon-border-yellow { border: 1px solid #ccff00 !important; box-shadow: 0 0 8px #ccff0033 !important; }

/* Destaque para os Filtros (Alta Visibilidade) */
.filter-focus {
  border: 2px solid #ccff00 !important;
  background-color: #050505 !important;
  color: #ccff00 !important;
}
/* --- APOIOTEC-BLACKOUT-END --- */
`;

function applyBlackout() {
  if (!fs.existsSync(CSS_PATH)) return console.error("❌ CSS não encontrado.");

  let content = fs.readFileSync(CSS_PATH, 'utf8');

  // Limpa absolutamente todos os scripts de tema anteriores (v1 até v4)
  const tags = [
    /\/\* --- APOIOTEC-NEON-INICIO --- \*\/[\s\S]*?\/\* --- APOIOTEC-NEON-FIM --- \*\//g,
    /\/\* --- APOIOTEC-NEON-V4-START --- \*\/[\s\S]*?\/\* --- APOIOTEC-NEON-V4-END --- \*\//g,
    /\/\* --- APOIOTEC CYBER-FORCE START --- \*\/[\s\S]*?\/\* --- APOIOTEC CYBER-FORCE END --- \*\//g,
    /\/\* --- APOIOTEC-BLACKOUT-START --- \*\/[\s\S]*?\/\* --- APOIOTEC-BLACKOUT-END --- \*\//g
  ];

  tags.forEach(tag => content = content.replace(tag, ""));

  fs.writeFileSync(CSS_PATH, BLACKOUT_THEME + "\n" + content);
  console.log("🚀 [APOIOTEC] Protocolo Blackout Ativado!");
  console.log("🌑 Telas e Cards agora são pretos. Bordas coloridas preservadas.");
}

applyBlackout();