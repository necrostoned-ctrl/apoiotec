const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');
const APP_PATH = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const SIDEBAR_PATH = path.join(process.cwd(), 'client', 'src', 'components', 'sidebar.tsx');

function applyFixes() {
    console.log("⚡ Iniciando Protocolo de Visibilidade Neon...");

    // 1. FORÇAR BRANCO NO CSS GLOBAL
    if (fs.existsSync(CSS_PATH)) {
        const extraCss = `
/* APOIOTEC HIGH-CONTRAST FIX */
body, html { background-color: #000000 !important; color: #ffffff !important; }
label, p, span, h1, h2, h3, h4, .text-muted-foreground { color: #ffffff !important; }
input, select, textarea, [role="combobox"] { 
    color: #ffffff !important; 
    background-color: #000000 !important; 
    border-color: rgba(0, 255, 255, 0.4) !important; 
}
.bg-white, .bg-card, .bg-background { background-color: #000000 !important; }
.text-gray-900, .text-gray-500, .text-slate-600 { color: #ffffff !important; }
.border-gray-200, .border-slate-200 { border-color: rgba(0, 255, 255, 0.2) !important; }
/* END FIX */
`;
        let css = fs.readFileSync(CSS_PATH, 'utf8');
        fs.writeFileSync(CSS_PATH, css + extraCss);
        console.log("✅ index.css: Fontes brancas forçadas.");
    }

    // 2. CORRIGIR ROTA 404 E HARDCODE ATIVAÇÃO
    if (fs.existsSync(APP_PATH)) {
        let app = fs.readFileSync(APP_PATH, 'utf8');
        
        // Garante que a ativação seja sempre TRUE (Bypass)
        app = app.replace(/const \[isActivated, setIsActivated\] = useState<boolean \| null>\(null\);/g, 'const [isActivated, setIsActivated] = useState<boolean>(true);');
        
        // Corrige a rota de Relatórios para o formato mais robusto
        app = app.replace(/<Route path="\/reports" component=\{Reports\} \/>/g, '<Route path="/reports"><Reports /></Route>');
        
        fs.writeFileSync(APP_PATH, app);
        console.log("✅ App.tsx: Rota de Relatórios corrigida e Bypass de ativação reafirmado.");
    }

    // 3. LIMPAR SIDEBAR
    if (fs.existsSync(SIDEBAR_PATH)) {
        let side = fs.readFileSync(SIDEBAR_PATH, 'utf8');
        // Troca o fundo da sidebar e as cores de texto do usuário
        side = side.replace(/bg-primary/g, 'bg-black');
        side = side.replace(/text-gray-900/g, 'text-white');
        side = side.replace(/text-gray-500/g, 'text-cyan-400');
        side = side.replace(/border-gray-200/g, 'border-cyan-500/30');
        fs.writeFileSync(SIDEBAR_PATH, side);
        console.log("✅ Sidebar: Estilo 'Dark Neon' aplicado.");
    }

    console.log("\n🚀 Tudo pronto! Verifique o navegador (F5).");
}

applyFixes();