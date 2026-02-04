const fs = require('fs');
const path = require('path');

const CSS_PATH = path.join(process.cwd(), 'client', 'src', 'index.css');
const SIDEBAR_PATH = path.join(process.cwd(), 'client', 'src/components/sidebar.tsx');
const BOTTOM_NAV_PATH = path.join(process.cwd(), 'client', 'src/components/bottom-nav.tsx');

function syncTheme() {
    console.log("🎨 Sincronizando tema Cyber-Tech em todo o sistema...");

    // 1. Atualizar CSS Global para Fundo Preto Absoluto
    if (fs.existsSync(CSS_PATH)) {
        const themeStyles = `
/* --- APOIOTEC THEME SYNC --- */
@layer base {
  :root, .dark {
    --background: 0 0% 0% !important;
    --foreground: 210 40% 98%;
    --card: 0 0% 0% !important;
    --popover: 0 0% 0% !important;
    --border: 180 100% 50% / 0.2;
    --primary: 180 100% 50%;
  }
}

body {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.neon-border-cyan { border: 1px solid #00ffff !important; box-shadow: 0 0 10px #00ffff44 !important; }
.neon-border-yellow { border: 1px solid #ccff00 !important; box-shadow: 0 0 10px #ccff0044 !important; }
.neon-border-green { border: 1px solid #39ff14 !important; box-shadow: 0 0 10px #39ff1444 !important; }
.neon-border-purple { border: 1px solid #bc13fe !important; box-shadow: 0 0 10px #bc13fe44 !important; }
/* --- END THEME SYNC --- */
`;
        let cssContent = fs.readFileSync(CSS_PATH, 'utf8');
        // Remove blocos antigos de tema se existirem
        cssContent = cssContent.replace(/\/\* --- APOIOTEC THEME SYNC --- \*\/[\s\S]*?\/\* --- END THEME SYNC --- \*\//g, "");
        fs.writeFileSync(CSS_PATH, themeStyles + cssContent);
        console.log("✅ CSS Global sincronizado.");
    }

    // 2. Ajustar Sidebar (Menu Lateral)
    if (fs.existsSync(SIDEBAR_PATH)) {
        let sidebarContent = fs.readFileSync(SIDEBAR_PATH, 'utf8');
        sidebarContent = sidebarContent.replace(/bg-white/g, "bg-black");
        sidebarContent = sidebarContent.replace(/border-r/g, "border-r border-cyan-500/30");
        fs.writeFileSync(SIDEBAR_PATH, sidebarContent);
        console.log("✅ Sidebar ajustada para modo Dark/Neon.");
    }

    // 3. Ajustar Bottom Nav (Celular)
    if (fs.existsSync(BOTTOM_NAV_PATH)) {
        let navContent = fs.readFileSync(BOTTOM_NAV_PATH, 'utf8');
        navContent = navContent.replace(/bg-white/g, "bg-black");
        navContent = navContent.replace(/border-t/g, "border-t border-cyan-500/50");
        fs.writeFileSync(BOTTOM_NAV_PATH, navContent);
        console.log("✅ Bottom Nav ajustado para modo Dark/Neon.");
    }
}

syncTheme();