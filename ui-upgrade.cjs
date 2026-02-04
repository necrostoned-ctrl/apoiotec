const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const UI_UPGRADE = `
/* --- APOIOTEC-UI-UPGRADE-START --- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

@layer base {
  :root, .dark {
    --font-sans: 'Inter', sans-serif !important;
  }

  html {
    /* Aumenta a escala global do sistema */
    font-size: 112.5% !important; /* De 16px para 18px */
  }

  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}

/* Melhoria nos Campos de Filtro (Alta Visibilidade) */
input, select, .filter-container {
  font-size: 1rem !important; /* Garante que o input não fique pequeno */
  border: 2px solid #ccff00 !important; /* Lima Neon */
  background-color: #0a0a0a !important;
  color: #ccff00 !important;
  border-radius: 8px !important;
  padding: 12px !important; /* Mais espaço para tocar no celular */
}

/* Estilo para labels de filtros */
label {
  font-weight: 600 !important;
  color: #00ffff !important; /* Ciano para os títulos dos filtros */
  margin-bottom: 4px;
  display: block;
  text-transform: uppercase;
  font-size: 0.8rem;
}

/* Ajuste de legibilidade para textos secundários */
.text-muted-foreground {
  color: #a1a1aa !important; /* Um cinza mais claro para não sumir no preto */
}
/* --- APOIOTEC-UI-UPGRADE-END --- */
`;

function applyUpgrade() {
  if (!fs.existsSync(CSS_PATH)) return console.error("❌ CSS não encontrado.");

  let content = fs.readFileSync(CSS_PATH, 'utf8');

  // Limpa o blackout antigo para não duplicar, mas mantém a base
  content = content.replace(/\/\* --- APOIOTEC-UI-UPGRADE-START --- \*\/[\s\S]*?\/\* --- APOIOTEC-UI-UPGRADE-END --- \*\//g, "");

  fs.writeFileSync(CSS_PATH, UI_UPGRADE + "\n" + content);
  console.log("🚀 [APOIOTEC] Upgrade de UI Concluído!");
  console.log("📏 Fonte aumentada, Inter aplicada e Filtros destacados.");
}

applyUpgrade();