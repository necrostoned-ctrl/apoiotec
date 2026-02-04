const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const DASHBOARD_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'dashboard.tsx');

function applyProTuning() {
    console.log("🚀 Iniciando Otimização Estrutural / Apoiotec...");

    if (!fs.existsSync(APP_PATH)) {
        console.error("❌ App.tsx não encontrado.");
        return;
    }

    let appContent = fs.readFileSync(APP_PATH, 'utf8');

    // 1. BYPASS TOTAL DA TRAVA DE HARDWARE
    appContent = appContent.replace(/const \[isActivated, setIsActivated\] = useState\(false\);/g, 'const [isActivated, setIsActivated] = useState(true);');
    appContent = appContent.replace(/useEffect\(\(\) => \{[\s\S]*?checkActivation\(\);[\s\S]*?\}, \[\]\);/g, '// Verificação de Hardware Removida');

    // 2. CONVERSÃO PARA LAZY LOADING (CARREGAMENTO DINÂMICO)
    // Transforma imports estáticos em lazy para economizar memória
    appContent = appContent.replace(/import (\w+) from ["']\.\/pages\/(\w+)["'];/g, 'const $1 = React.lazy(() => import("./pages/$2"));');

    // 3. INJEÇÃO DO SUSPENSE (FUNDAMENTAL PARA LAZY)
    if (!appContent.includes('<Suspense')) {
        // Envolve o componente Switch com Suspense
        appContent = appContent.replace(/<Switch>/g, '<React.Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-cyan-500 font-mono">CARREGANDO SISTEMA APOIOTEC...</div>}>\n      <Switch>');
        appContent = appContent.replace(/<\/Switch>/g, '</Switch>\n    </React.Suspense>');
    }

    fs.writeFileSync(APP_PATH, appContent);
    console.log("✅ App.tsx: Hardware Lock removido e Suspense injetado.");

    // 4. LIMPEZA DE GRÁFICOS NO DASHBOARD
    if (fs.existsSync(DASHBOARD_PATH)) {
        let dashContent = fs.readFileSync(DASHBOARD_PATH, 'utf8');
        // Remove Radar e Scatter (pesados e pouco informativos)
        const uselessCharts = ['RadarChart', 'ScatterChart', 'Radar', 'Scatter'];
        uselessCharts.forEach(chart => {
            const regex = new RegExp(`<${chart}[^>]*>[\\s\\S]*?<\/${chart}>|<${chart}[^/>]*\/>`, 'g');
            dashContent = dashContent.replace(regex, '{/* Gráfico removido para performance */}');
        });
        
        fs.writeFileSync(DASHBOARD_PATH, dashContent);
        console.log("✅ Dashboard.tsx: Gráficos inúteis removidos.");
    }

    console.log("\n🔥 Sistema pronto para o Fly.io com 256MB!");
}

applyProTuning();