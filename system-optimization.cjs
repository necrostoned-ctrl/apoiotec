const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(__dirname, 'client', 'src', 'App.tsx');
const DASHBOARD_PATH = path.join(__dirname, 'client', 'src', 'pages', 'dashboard.tsx');
const ROUTES_PATH = path.join(__dirname, 'server', 'routes.ts');

function optimize() {
    console.log("🚀 Iniciando Protocolo de Otimização Apoiotec...");

    // 1. DESATIVAR TRAVA DE HARDWARE (FRONTEND)
    if (fs.existsSync(APP_PATH)) {
        let appContent = fs.readFileSync(APP_PATH, 'utf8');
        // Força o estado de ativação para true e remove a verificação
        appContent = appContent.replace(/const \[isActivated, setIsActivated\] = useState\(false\);/g, 'const [isActivated, setIsActivated] = useState(true);');
        // Comenta a chamada do useEffect de ativação se existir
        appContent = appContent.replace(/checkActivation\(\);/g, '// checkActivation(); // Trava Removida');
        
        // 2. APLICAR LAZY LOADING (Simples)
        // Converte imports de páginas para lazy imports para economizar RAM
        appContent = appContent.replace(/import (\w+) from ['"]\.\/pages\/(\w+)['"];/g, 'const $1 = React.lazy(() => import("./pages/$2"));');
        
        fs.writeFileSync(APP_PATH, appContent);
        console.log("✅ Frontend: Trava desativada e Lazy Loading preparado.");
    }

    // 3. LIMPEZA DO DASHBOARD (REMOÇÃO DE GRÁFICOS INÚTEIS)
    if (fs.existsSync(DASHBOARD_PATH)) {
        let dashContent = fs.readFileSync(DASHBOARD_PATH, 'utf8');
        // Remove bibliotecas pesadas de gráficos que não trazem info útil
        const componentsToRemove = ['RadarChart', 'ScatterChart', 'PolarGrid', 'PolarAngleAxis', 'Radar', 'Scatter'];
        componentsToRemove.forEach(comp => {
            dashContent = dashContent.replace(new RegExp(`<${comp}[^>]*>.*?</${comp}>`, 'gs'), '');
            dashContent = dashContent.replace(new RegExp(`<${comp}[^/>]*/>`, 'g'), '');
        });
        
        fs.writeFileSync(DASHBOARD_PATH, dashContent);
        console.log("✅ Dashboard: Gráficos 'mórbidos' removidos.");
    }

    // 4. DESATIVAR TRAVA DE HARDWARE (BACKEND)
    if (fs.existsSync(ROUTES_PATH)) {
        let routesContent = fs.readFileSync(ROUTES_PATH, 'utf8');
        // Comenta o middleware ou rota de ativação
        routesContent = routesContent.replace(/router\.post\(['"]\/api\/activate['"]/g, '/* Trava Desativada */ router.post("/api/activate_disabled"');
        
        fs.writeFileSync(ROUTES_PATH, routesContent);
        console.log("✅ Backend: Rotas de ativação neutralizadas.");
    }

    console.log("\n🔥 Otimização concluída! Rode 'npm run dev' para testar localmente antes do 'fly deploy'.");
}

optimize();