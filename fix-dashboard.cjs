const fs = require('fs');
const path = require('path');

const DASHBOARD_PATH = path.join(process.cwd(), 'client', 'src', 'pages', 'dashboard.tsx');

const NEW_DASHBOARD_CODE = `
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">
          Apoiotec / <span className="text-cyan-500">Command Center</span>
        </h2>
      </div>

      {/* KPI CARDS - ALTA VISIBILIDADE */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neon-border-cyan bg-black border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Chamados Hoje</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-muted-foreground">+2 desde a última hora</p>
          </CardContent>
        </Card>

        <Card className="neon-border-yellow bg-black border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5</div>
            <p className="text-xs text-muted-foreground">3 aguardando peça</p>
          </CardContent>
        </Card>

        <Card className="neon-border-green bg-black border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Concluídos/Mês</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">48</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card className="neon-border-purple bg-black border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Receita Estimada</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ 4.250</div>
            <p className="text-xs text-muted-foreground">Previsão para dia 10</p>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DE TRABALHO RÁPIDO */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-black border-primary/20">
          <CardHeader>
            <CardTitle className="text-cyan-500 uppercase text-sm font-bold">Últimas Atualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm italic">
              Nenhuma movimentação crítica detectada nos últimos 30 minutos.
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 bg-black border-primary/20">
          <CardHeader>
            <CardTitle className="text-yellow-500 uppercase text-sm font-bold">Status do Servidor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="text-white">Fly.io (GRU)</span>
                <span className="text-green-500 font-bold">● ONLINE</span>
             </div>
             <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[15%]" />
             </div>
             <p className="text-[10px] text-muted-foreground">Uso de RAM: 38MB / 256MB</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

try {
    fs.writeFileSync(DASHBOARD_PATH, NEW_DASHBOARD_CODE);
    console.log("🚀 [APOIOTEC] dashboard.tsx reescrito com sucesso!");
} catch (err) {
    console.error("❌ Erro ao escrever arquivo: " + err.message);
}