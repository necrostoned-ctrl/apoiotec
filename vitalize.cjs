const fs = require('fs');
const path = require('path');

// Localização padrão do CSS no seu projeto React/Tailwind
const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

const VIBRANT_THEME = `
/* --- APOIOTEC VIBRANT THEME --- */
@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --primary: 221.2 83.2% 53.3%; /* Azul Tech Vivo */
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 3.5%; /* Fundo Deep Sea */
    --card: 222.2 84% 6%;
    --primary: 199 89% 48%; /* Ciano Elétrico */
    --border: 217.2 32.6% 18%;
  }
}

@layer components {
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }
  
  .btn-vibrant {
    background: linear-gradient(45deg, hsl(var(--primary)), #3b82f6);
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
  }
}
/* ------------------------------ */
`;

function vitalize() {
    if (!fs.existsSync(CSS_PATH)) {
        console.error("❌ Erro: Arquivo não encontrado em " + CSS_PATH);
        return;
    }

    try {
        const content = fs.readFileSync(CSS_PATH, 'utf8');
        
        // Evita duplicar o script se rodar duas vezes
        if (content.includes('APOIOTEC VIBRANT THEME')) {
            console.log("⚠️ O tema já foi aplicado anteriormente.");
            return;
        }

        const updatedContent = VIBRANT_THEME + "\n" + content;
        fs.writeFileSync(CSS_PATH, updatedContent);
        
        console.log("🚀 [APOIOTEC] Estilo injetado com sucesso!");
        console.log("✅ O modo 'mórbido' foi removido.");
    } catch (err) {
        console.error("❌ Falha ao processar o arquivo: " + err.message);
    }
}

vitalize();