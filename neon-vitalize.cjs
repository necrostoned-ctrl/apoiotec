const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const START_TAG = "/* --- APOIOTEC-NEON-INICIO --- */";
const END_TAG = "/* --- APOIOTEC-NEON-FIM --- */";

const NEON_CSS = `
${START_TAG}
@layer base {
  :root {
    --background: 240 10% 2%;
    --card: 0 0% 0%;             /* Preto Absoluto */
    --primary: 180 100% 50%;     /* Ciano */
    --accent: 75 100% 50%;       /* Lima (Filtros) */
    --border: 180 100% 50% / 0.3;
  }
}

@layer components {
  .neon-card {
    background: #000000 !important;
    border: 1px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
  }
  
  .filter-highlight {
    border-left: 4px solid #bfff00;
    background: rgba(191, 255, 0, 0.05);
    color: #bfff00;
    padding: 10px;
  }
}
${END_TAG}
`;

function applyNeon() {
  if (!fs.existsSync(CSS_PATH)) {
    console.error("❌ Arquivo não encontrado: " + CSS_PATH);
    return;
  }

  try {
    let content = fs.readFileSync(CSS_PATH, 'utf8');

    // Se já existe o tema, vamos removê-lo para não duplicar
    if (content.indexOf(START_TAG) !== -1) {
      const parts = content.split(END_TAG);
      // Pega apenas o que vem depois do fim do tema antigo
      content = parts.length > 1 ? parts[1].trim() : content;
      
      // Remove o que sobrou antes (o início do tema antigo)
      const startIdx = content.indexOf(START_TAG);
      if (startIdx !== -1) {
        content = content.substring(content.indexOf(END_TAG) + END_TAG.length);
      }
    }

    // Monta o arquivo: Novo Tema + Restante do código
    const finalContent = NEON_CSS + "\n\n" + content;
    fs.writeFileSync(CSS_PATH, finalContent);

    console.log("🚀 [APOIOTEC] Sistema Vitalizado com Neon!");
    console.log("✅ Preto absoluto e filtros Lima configurados.");
  } catch (err) {
    console.error("❌ Erro fatal: " + err.message);
  }
}

applyNeon();