const fs = require('fs');
const path = require('path');

// Ajuste o caminho para onde está o seu arquivo de Dashboard (ex: Dashboard.tsx)
const DASHBOARD_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'Dashboard.tsx');

const NEW_DASHBOARD_UI = `
{/* --- APOIOTEC FUNCTIONAL DASHBOARD START --- */}
<div className="p-4 md:p-8 space-y-6 bg-black min-h-screen font-sans">
  {/* CABEÇALHO COM INFOS DE SISTEMA */}
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-2xl font-black text-primary tracking-tighter uppercase">Painel de Controle / Apoiotec</h1>
    <div className="flex gap-4">
      <div className="px-3 py-1 border border-green-500/50 rounded text-[10px] text-green-500 animate-pulse">
        FLY.IO: ONLINE
      </div>
      <div className="px-3 py-1 border border-cyan-500/50 rounded text-[10px] text-cyan-500">
        SUPABASE: CONNECTED
      </div>
    </div>
  </div>

  {/* CARDS DE INDICADORES (KPIs) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="neon-card p-5 rounded-lg border-l-4 border-l-cyan-500">
      <p className="text-[10px] uppercase text-muted-foreground mb-1">Faturamento Mensal</p>
      <h2 className="text-2xl font-black text-white">R$ {faturamentoTotal || '0,00'}</h2>
    </div>
    <div className="neon-card p-5 rounded-lg border-l-4 border-l-yellow-500">
      <p className="text-[10px] uppercase text-muted-foreground mb-1">OS Pendentes</p>
      <h2 className="text-2xl font-black text-white">{osPendentesCount || 0}</h2>
    </div>
    <div className="neon-card p-5 rounded-lg border-l-4 border-l-purple-500">
      <p className="text-[10px] uppercase text-muted-foreground mb-1">Aguardando Peça</p>
      <h2 className="text-2xl font-black text-white">{aguardandoPecaCount || 0}</h2>
    </div>
    <div className="neon-card p-5 rounded-lg border-l-4 border-l-green-500">
      <p className="text-[10px] uppercase text-muted-foreground mb-1">Lucro Estimado</p>
      <h2 className="text-2xl font-black text-white">R$ {lucroEstimado || '0,00'}</h2>
    </div>
  </div>

  {/* ÁREA DE OPERAÇÃO: FILTROS E LISTA */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* FILTROS RÁPIDOS (ALTA VISIBILIDADE) */}
    <div className="lg:col-span-1 space-y-4">
      <div className="filter-highlight rounded-lg">
        <h3 className="text-xs font-bold mb-3 uppercase">Busca Rápida</h3>
        {/* Seus componentes de filtro aqui */}
      </div>
    </div>

    {/* LISTA DE SERVIÇOS PRIORITÁRIOS */}
    <div className="lg:col-span-3 neon-card p-0 overflow-hidden">
      <div className="bg-primary/10 p-4 border-b border-primary/20">
        <h3 className="text-sm font-bold uppercase tracking-widest">Últimas Atualizações de Bancada</h3>
      </div>
      <div className="p-4">
        {/* Sua Tabela de OS aqui, com fontes maiores e mais contraste */}
      </div>
    </div>
  </div>
</div>
{/* --- APOIOTEC FUNCTIONAL DASHBOARD END --- */}
`;

function updateDashboard() {
  if (!fs.existsSync(DASHBOARD_PATH)) {
    console.error("❌ Arquivo Dashboard.tsx não encontrado no caminho: " + DASHBOARD_PATH);
    return;
  }

  try {
    let content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

    // Esta parte é delicada: ela tenta encontrar o return do componente e trocar o JSX
    // Se o seu arquivo for muito diferente, ele apenas injeta o novo código no topo para você copiar
    if (content.includes('return')) {
      console.log("🚀 [APOIOTEC] Dashboard localizado. Injetando nova interface funcional...");
      // Nota: Esta automação é visual. Você precisará ajustar as variáveis (como faturamentoTotal)
      // para baterem com os nomes que você usa no seu useState/useQuery.
      fs.writeFileSync(path.join(process.cwd(), 'client', 'src', 'pages', 'Dashboard_NOVO.tsx'), NEW_DASHBOARD_UI + "\\n\\n" + content);
      console.log("✅ Criado o arquivo 'Dashboard_NOVO.tsx'. Abra-o e substitua o return antigo por este novo.");
    }
  } catch (err) {
    console.error("❌ Erro ao processar o dashboard: " + err.message);
  }
}

updateDashboard();