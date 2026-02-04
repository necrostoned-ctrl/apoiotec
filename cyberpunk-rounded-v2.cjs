const fs = require('fs');
const path = require('path');

const DASHBOARD_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'dashboard.tsx');
const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');

function applyAestheticFix() {
    console.log("🎨 Iniciando a restauração estética da Apoiotec...");

    // 1. CORRIGIR O TÍTULO DO DASHBOARD
    if (fs.existsSync(DASHBOARD_PATH)) {
        let dash = fs.readFileSync(DASHBOARD_PATH, 'utf8');
        
        // Remove o título "Command Center" e volta para "Dashboard"
        // Também injeta o azul mais escuro futurista no título
        dash = dash.replace(/<h2.*?>.*?Command Center.*?<\/h2>/s, 
            '<h1 className="text-3xl font-extrabold tracking-tighter text-blue-500 uppercase italic">Dashboard</h1>');
        
        // Caso o h1 já exista mas esteja com outra cor, forçamos o novo azul
        dash = dash.replace(/text-purple-400">Dashboard<\/h1>/g, 'text-blue-500 uppercase italic font-black">Dashboard</h1>');
        
        fs.writeFileSync(DASHBOARD_PATH, dash);
        console.log("✅ Dashboard: Título restaurado para 'Dashboard' com azul futurista.");
    }

    // 2. CORRIGIR BORDAS E TEMA NO CSS
    if (fs.existsSync(CSS_PATH)) {
        const cyberpunkTheme = `
/* --- APOIOTEC CYBER-ROUNDED THEME --- */
@layer base {
  :root, .dark {
    --radius: 0.75rem !important; /* Bordas arredondadas de volta */
    --background: 0 0% 0% !important;
    --foreground: 210 40% 98%;
    
    /* Novo Azul Apoiotec: Mais escuro e futurista */
    --primary: 210 100% 40% !important; 
    --primary-foreground: 210 40% 98%;
    
    --border: 210 100% 30% / 0.3 !important;
  }

  /* Forçar arredondamento em tudo que for Card ou Modal */
  .card, [role="dialog"], .bg-card, .border-2 {
    border-radius: 0.75rem !important;
  }
}

body {
  background-color: #000000 !important;
  color: #ffffff !important;
}

/* Efeito Neon Futurista (Azul mais escuro) */
.neon-border-blue { 
  border: 2px solid #0055ff !important; 
  box-shadow: 0 0 15px #0055ff33, inset 0 0 5px #0055ff22 !important; 
}

/* Ajuste de fontes para campos de filtro (Branco para não sumir) */
input, select {
  border-radius: 0.5rem !important;
  border-color: #0055ff55 !important;
  color: white !important;
}

label {
  color: #00ccff !important; /* Ciano para os labels */
}
/* --- END THEME --- */
`;
        // Limpa o arquivo e injeta o tema novo no topo
        let css = fs.readFileSync(CSS_PATH, 'utf8');
        // Remove blocos de temas anteriores se existirem
        css = css.replace(/\/\* --- APOIOTEC .*? THEME --- \*\/[\s\S]*?\/\* --- END THEME --- \*\//g, "");
        
        fs.writeFileSync(CSS_PATH, cyberpunkTheme + css);
        console.log("✅ index.css: Bordas arredondadas e Azul Futurista aplicados.");
    }
}

applyAestheticFix();