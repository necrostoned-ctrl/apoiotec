import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart
} from "recharts";
import { 
  Users, 
  Phone, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Wrench,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  AlertTriangle,
  Shield
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getPriorityColor, getPriorityLabel, getStatusLabel } from "@/lib/utils";
import { Link } from "wouter";
import type { CallWithClient, Service, FinancialTransactionWithClient, Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UniversalSearch } from "@/components/universal-search";
import { useState, useMemo } from "react";

// Helper function to extract clean description from transaction
const getCleanDescription = (description: string): string => {
  if (!description) return "Sem descrição";
  
  // If description contains structured data (JSON), extract only the readable part
  if (description.includes('[{') && description.includes('}]')) {
    const lines = description.split('\n');
    // Find lines before "Discriminação de valores:" or JSON data
    const cleanLines = lines.filter(line => 
      !line.includes('[{') &&
      !line.includes('}]') &&
      !line.includes('Discriminação de valores:') &&
      !line.includes('Serviços:') &&
      !line.includes('Produtos/Materiais:') &&
      !line.startsWith('- R$') &&
      line.trim() !== ''
    );
    
    return cleanLines.join(' ').trim() || lines[0] || "Serviço";
  }
  
  // For regular descriptions, return first line without truncation
  const firstLine = description.split('\n')[0];
  return firstLine;
};

// Component for admin controls - REMOVIDO PARA SEGURANÇA
// Não exibe mais o botão admin
function AdminControls() {
  return null;
}

// Funções para gerar dados dos gráficos
function getMonthlyRevenueData(transactions: any[]) {
  const months: Record<string, { receita: number; despesa: number }> = {};
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
    months[monthKey] = { receita: 0, despesa: 0 };
  }
  
  transactions.forEach((t: any) => {
    const date = t.paidAt ? new Date(t.paidAt) : new Date(t.createdAt);
    const monthKey = `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
    
    if (months[monthKey]) {
      if (t.type === 'entrada' && t.status === 'pago') {
        months[monthKey].receita += parseFloat(t.amount.toString());
      } else if (t.type === 'saida') {
        months[monthKey].despesa += parseFloat(t.amount.toString());
      }
    }
  });
  
  return Object.entries(months).map(([key, value]) => ({
    mes: key,
    receita: Math.round(value.receita / 100) / 100,
    despesa: Math.round(value.despesa / 100) / 100
  }));
}

function getFinancialDistribution(transactions: any[], stats: any): Array<{ name: string; value: number }> {
  const received = stats.monthlyRevenue || 0;
  const pending = stats.monthlyPending || 0;
  const expenses = stats.monthlyExpenses || 0;
  const total = received + pending + expenses;
  
  return [
    { name: 'Recebido', value: total > 0 ? Math.round((received / total) * 100) : 0 },
    { name: 'Pendente', value: total > 0 ? Math.round((pending / total) * 100) : 0 },
    { name: 'Despesa', value: total > 0 ? Math.round((expenses / total) * 100) : 0 }
  ];
}

function getCallsByPriority(calls: any[]): Array<{ prioridade: string; quantidade: number }> {
  const priorities: Record<string, number> = { urgente: 0, alta: 0, media: 0, baixa: 0 };
  
  calls.forEach((call: any) => {
    if (call.priority && priorities.hasOwnProperty(call.priority)) {
      priorities[call.priority]++;
    }
  });
  
  return [
    { prioridade: 'Urgente', quantidade: priorities.urgente },
    { prioridade: 'Alta', quantidade: priorities.alta },
    { prioridade: 'Média', quantidade: priorities.media },
    { prioridade: 'Baixa', quantidade: priorities.baixa }
  ];
}

function getCallsByStatus(calls: any[]): Array<{ name: string; value: number }> {
  const statuses: Record<string, number> = { aberto: 0, concluido: 0, em_andamento: 0, cancelado: 0 };
  
  calls.forEach((call: any) => {
    if (call.status && statuses.hasOwnProperty(call.status)) {
      statuses[call.status]++;
    }
  });
  
  return [
    { name: 'Aberto', value: statuses.aberto },
    { name: 'Em Andamento', value: statuses.em_andamento },
    { name: 'Concluído', value: statuses.concluido },
    { name: 'Cancelado', value: statuses.cancelado }
  ];
}

function calcularMetricas(calls: any[], services: any[], transactions: any[], stats: any) {
  const callsConcluidos = calls.filter(c => c.status === 'concluido').length;
  const callsAbertos = calls.filter(c => c.status === 'aberto').length;
  const servicesConcluidos = services.filter(s => s.status === 'concluido').length;
  const servicesTotais = services.length;
  
  const ticketMedio = transactions.filter(t => t.type === 'entrada').length > 0 
    ? stats.monthlyRevenue / transactions.filter(t => t.type === 'entrada' && t.status === 'pago').length
    : 0;
  
  const taxaConclusao = calls.length > 0 ? (callsConcluidos / calls.length) * 100 : 0;
  const lucro = stats.monthlyRevenue - stats.monthlyExpenses;
  const margemLucro = stats.monthlyRevenue > 0 ? (lucro / stats.monthlyRevenue) * 100 : 0;
  
  return {
    callsConcluidos,
    callsAbertos,
    servicesConcluidos,
    servicesTotais,
    ticketMedio,
    taxaConclusao,
    lucro,
    margemLucro
  };
}

export default function Dashboard() {
  const [selectedCall, setSelectedCall] = useState<CallWithClient | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data: calls = [] } = useQuery<CallWithClient[]>({
    queryKey: ["/api/calls"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: transactions = [] } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: expiringCertificates = [] } = useQuery<any[]>({
    queryKey: ["/api/digital-certificates/expiry-warning"],
  });

  // Chamados recentes (últimos 5) - apenas ordena por data, nenhum filtro de status
  const recentCalls = (calls as CallWithClient[])
    .filter((call: CallWithClient) => {
      // Apenas validar dados básicos
      if (!call || !call.id) return false;
      if (!call.description || call.description.trim() === '') return false;
      return true;
    })
    .sort((a: CallWithClient, b: CallWithClient) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Serviços em andamento - apenas status "Em Andamento" ou sem status concluído
  const activeServices = services
    .filter(s => s && s.name && s.basePrice)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Transações pendentes
  const pendingTransactions = transactions.filter(t => t.status === "pendente");

  // Calcular estatísticas reais a partir dos dados
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Chamados de hoje
  const todayCalls = (calls as CallWithClient[]).filter((call: CallWithClient) => {
    const callDate = new Date(call.createdAt);
    return callDate >= todayStart;
  }).length;

  // Calcular estatísticas em tempo real (igual Financeiro)
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Receita total recebida (pago)
    const totalReceived = transactions
      .filter(t => t.type === "entrada" && t.status === "pago")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Receita mensal (usar paidAt para transações pagas, assim como Financeiro usa)
    const monthlyRevenue = transactions
      .filter(t => {
        if (t.type !== "entrada" || t.status !== "pago") return false;
        
        // Para transações pagas, usar data de pagamento (paidAt)
        let dateToCheck;
        if (t.paidAt) {
          dateToCheck = new Date(t.paidAt);
        } else {
          dateToCheck = new Date(t.createdAt);
        }
        
        return dateToCheck.getMonth() === currentMonth && 
               dateToCheck.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Valor pendente (não recebido)
    const pendingAmount = transactions
      .filter(t => t.type === "entrada" && (t.status === "pendente" || t.status === "parcial" || t.status === "parcelado"))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Valor a receber (parcelas não pagas)
    const totalToReceive = transactions
      .filter(t => t.type === "entrada" && t.status !== "pago" && t.status !== "cancelado")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Despesas totais
    const totalExpenses = transactions
      .filter(t => t.type === "saida")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Despesas do mês (gastos criados neste mês)
    const monthlyExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        return t.type === "saida" && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Pendentes do mês (entradas não pagas criadas neste mês)
    const monthlyPending = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        return t.type === "entrada" && 
               (t.status === "pendente" || t.status === "parcial" || t.status === "parcelado") &&
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Lucro (receita - despesas)
    const profit = totalReceived - totalExpenses;

    return {
      totalReceived,
      monthlyRevenue,
      monthlyExpenses,
      monthlyPending,
      pendingAmount,
      totalToReceive,
      totalExpenses,
      profit,
    };
  }, [transactions]);



  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-8 pb-32">
      {/* Header com Busca Universal */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
            <p className="text-gray-400">Visão geral do sistema de gestão técnica</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/new-call">
              <Button className="bg-cyan-600 hover:bg-cyan-700 border-2 border-cyan-500 dark:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 dark:shadow-cyan-500/20 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chamado
              </Button>
            </Link>
            <AdminControls />
          </div>
        </div>
        
        {/* Busca Universal */}
        <div className="w-full">
          <UniversalSearch />
        </div>
      </div>

      {/* Alerta de Certificados Expirando */}
      {expiringCertificates.length > 0 && (
        <Link href="/digital-certificates">
          <Card className="bg-amber-900/30 border-2 border-amber-500 cursor-pointer hover:bg-amber-900/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-amber-400" />
                <div className="flex-1">
                  <p className="text-amber-400 font-semibold">
                    {expiringCertificates.some((c: any) => c.status === 'expired') 
                      ? 'Certificado Digital Expirado!' 
                      : 'Certificado Digital Expirando'}
                  </p>
                  <p className="text-sm text-amber-300/80">
                    {expiringCertificates[0]?.name} - Clique para gerenciar
                  </p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Link href="/calls">
          <Card className="bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all cursor-pointer h-28">
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-primary dark:text-blue-400 mb-1">Chamados Hoje</p>
              <p className="text-xl font-bold text-primary dark:text-blue-400">{todayCalls}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financial">
          <Card className="bg-background dark:bg-slate-800 border-4 border-green-600 dark:border-green-500 hover:shadow-lg hover:shadow-green-600/50 shadow-lg dark:shadow-green-600/20 transition-all cursor-pointer h-28">
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Receita Mensal</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 text-center break-words">{formatCurrency(stats.monthlyRevenue)}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financial">
          <Card className="bg-background dark:bg-slate-800 border-4 border-red-600 dark:border-red-500 hover:shadow-lg hover:shadow-red-600/50 shadow-lg dark:shadow-red-600/20 transition-all cursor-pointer h-28">
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Gastos do Mês</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 text-center break-words">{formatCurrency(stats.monthlyExpenses)}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financial">
          <Card className="bg-background dark:bg-slate-800 border-4 border-yellow-500 dark:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 shadow-lg dark:shadow-yellow-500/20 transition-all cursor-pointer h-28">
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Pendências do Mês</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 text-center break-words">{formatCurrency(stats.monthlyPending)}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Gráficos e Cards Informativos - Grid 2 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Faturamento por Mês */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-purple-600 dark:border-purple-500 hover:shadow-lg hover:shadow-purple-600/50 shadow-lg dark:shadow-purple-600/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Faturamento 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getMonthlyRevenueData(transactions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 11 }} />
                <YAxis stroke="#888" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #8b5cf6', fontSize: 12 }} />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} name="Despesa" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição Financeira */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-indigo-600 dark:border-indigo-500 hover:shadow-lg hover:shadow-indigo-600/50 shadow-lg dark:shadow-indigo-600/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-indigo-500" />
              Distribuição Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={getFinancialDistribution(transactions, stats)} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" label={{ fontSize: 11 }}>
                  <Cell fill="#10b981" /><Cell fill="#ef4444" /><Cell fill="#f59e0b" />
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chamados por Prioridade */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-cyan-600 dark:border-cyan-500 hover:shadow-lg hover:shadow-cyan-600/50 shadow-lg dark:shadow-cyan-600/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-cyan-500" />
              Chamados por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getCallsByPriority(calls)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 11 }} />
                <YAxis stroke="#888" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="quantidade" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Chamados */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-rose-600 dark:border-rose-500 hover:shadow-lg hover:shadow-rose-600/50 shadow-lg dark:shadow-rose-600/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-rose-500" />
              Status Chamados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={getCallsByStatus(calls)} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" label={{ fontSize: 11 }}>
                  <Cell fill="#3b82f6" /><Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Diversos - Figuras Representativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Área Acumulada - Evolução de Receita e Despesa */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-emerald-600 dark:border-emerald-500 hover:shadow-lg hover:shadow-emerald-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-emerald-500" />Evolução Acumulada</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={getMonthlyRevenueData(transactions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', fontSize: 11 }} />
                <Area type="monotone" dataKey="receita" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="despesa" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar - Análise Multidimensional */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-violet-600 dark:border-violet-500 hover:shadow-lg hover:shadow-violet-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-violet-500" />Análise de Prioridades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={getCallsByPriority(calls)}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="prioridade" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                <Radar name="Quantidade" dataKey="quantidade" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Composição - Comparação Receita/Despesa por Status */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-cyan-600 dark:border-cyan-500 hover:shadow-lg hover:shadow-cyan-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-cyan-500" />Composição Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={getMonthlyRevenueData(transactions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', fontSize: 11 }} />
                <Bar dataKey="receita" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="despesa" stroke="#f97316" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tipo Dispersão - Distribuição de Valores */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-orange-600 dark:border-orange-500 hover:shadow-lg hover:shadow-orange-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-orange-500" />Distribuição de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', fontSize: 11 }} cursor={{ fill: 'rgba(255,0,0,0.1)' }} />
                <Scatter name="Receitas" data={transactions.filter(t => t.type === 'entrada').slice(0, 30).map((t, i) => ({ x: i + 1, y: parseFloat(t.amount.toString()) / 100 }))} fill="#10b981" />
                <Scatter name="Despesas" data={transactions.filter(t => t.type === 'saida').slice(0, 30).map((t, i) => ({ x: i + 1, y: parseFloat(t.amount.toString()) / 100 }))} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barras Comparativas - Status vs Prioridade */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-pink-600 dark:border-pink-500 hover:shadow-lg hover:shadow-pink-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-pink-500" />Panorama de Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={getCallsByStatus(calls)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#888" tick={{ fontSize: 10 }} />
                <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', fontSize: 11 }} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut duplo - Proporção Final */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-rose-600 dark:border-rose-500 hover:shadow-lg hover:shadow-rose-600/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-rose-500" />Proporção Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[{ name: 'Receita', value: stats.monthlyRevenue }, { name: 'Despesa', value: stats.monthlyExpenses }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={{ fontSize: 10 }}>
                  <Cell fill="#10b981" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chamados Recentes */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-cyan-500" />
              Chamados Recentes
            </CardTitle>
            <Link href="/calls">
              <Button variant="outline" size="sm">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum chamado registrado ainda</p>
            ) : (
              <div className="space-y-4">
                {recentCalls.map((call: CallWithClient) => {
                  const priorityColorMap: Record<string, string> = {
                    "urgente": "bg-red-500",
                    "alta": "bg-orange-500",
                    "media": "bg-blue-500",
                    "baixa": "bg-gray-400"
                  };
                  
                  const priorityColor = priorityColorMap[call.priority] || "bg-gray-400";
                  
                  const priorityNeonMap: Record<string, string> = {
                    "urgente": "border-4 border-red-600 dark:border-red-500 hover:shadow-lg hover:shadow-red-600/50 dark:shadow-red-600/20",
                    "alta": "border-4 border-orange-600 dark:border-orange-500 hover:shadow-lg hover:shadow-orange-600/50 dark:shadow-orange-600/20",
                    "media": "border-4 border-yellow-500 dark:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 dark:shadow-yellow-500/20",
                    "baixa": "border-4 border-green-600 dark:border-green-500 hover:shadow-lg hover:shadow-green-600/50 dark:shadow-green-600/20"
                  };
                  
                  const priorityNeon = priorityNeonMap[call.priority] || "border-2 border-gray-400";
                  
                  return (
                    <div key={call.id} className={`flex items-start justify-between p-3 rounded-lg transition-colors gap-3 shadow-lg ${priorityNeon}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {call.description}
                          </h4>
                          <Badge variant="outline" className={`${getStatusColor(call.status)} text-xs border font-semibold`}>
                            {getStatusLabel(call.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Cliente: {call.client?.name} • {formatDate(call.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <div className={`w-3 h-3 rounded-full ${priorityColor}`} title={getPriorityLabel(call.priority)}></div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCall(call)}>
                          Ver
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Serviços em Andamento */}
        <Card className="bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-500" />
              Serviços em Andamento
            </CardTitle>
            <Link href="/services">
              <Button variant="outline" size="sm">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeServices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum serviço em andamento</p>
            ) : (
              <div className="space-y-4">
                {activeServices.slice(0, 5).map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border-4 border-primary dark:border-blue-500 rounded-lg transition-colors hover:shadow-lg hover:shadow-blue-600/50 dark:shadow-blue-600/20">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {service.name}
                        </h4>
                        <Badge variant="outline" className={`${getStatusColor("em-andamento")} text-xs border font-semibold text-blue-500 dark:text-blue-400`}>
                          {formatCurrency(parseFloat(service.basePrice?.toString() || "0"))}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Cliente: {service.client?.name || "Sem cliente"} • {service.description || "Sem descrição"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedService(service)}>
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transações Pendentes */}
        <Card className="lg:col-span-2 bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transações Pendentes
            </CardTitle>
            <Link href="/financial">
              <Button variant="outline" size="sm">Ver Todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma transação pendente</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingTransactions.slice(0, 4).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border-4 border-yellow-500 dark:border-yellow-400 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 dark:shadow-yellow-500/20 transition-colors bg-background dark:bg-slate-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {getCleanDescription(transaction.description || "")}
                        </h4>
                        <Badge variant="outline" className={`${getStatusColor(transaction.type === "entrada" ? "concluido" : "cancelado")} text-xs border font-semibold`}>
                          {formatCurrency(parseFloat(transaction.amount.toString()))}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        Cliente: {transaction.client?.name || "N/A"}
                      </p>
                    </div>
                    <Link href="/financial">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/new-call">
              <Button className="h-20 flex-col gap-2 w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-4 border-blue-500 dark:border-primary hover:shadow-lg hover:shadow-blue-500/50 dark:shadow-blue-500/20">
                <Phone className="h-6 w-6" />
                <span className="text-sm">Novo Chamado</span>
              </Button>
            </Link>
            <Link href="/clients">
              <Button className="h-20 flex-col gap-2 w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-4 border-green-500 dark:border-green-600 hover:shadow-lg hover:shadow-green-500/50 dark:shadow-green-500/20">
                <Users className="h-6 w-6" />
                <span className="text-sm">Clientes</span>
              </Button>
            </Link>
            <Link href="/financial">
              <Button className="h-20 flex-col gap-2 w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-4 border-purple-500 dark:border-purple-600 hover:shadow-lg hover:shadow-purple-500/50 dark:shadow-purple-500/20">
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Financeiro</span>
              </Button>
            </Link>
            <Link href="/reports">
              <Button className="h-20 flex-col gap-2 w-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-4 border-orange-500 dark:border-orange-600 hover:shadow-lg hover:shadow-orange-500/50 dark:shadow-orange-500/20">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Relatórios</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Chamado */}
      <Dialog open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-2 border-pink-500 shadow-2xl shadow-pink-500/30">
          <DialogHeader>
            <DialogTitle>Detalhes do Chamado</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Descrição</h3>
                <p className="text-gray-900 dark:text-white mt-1">{selectedCall.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Cliente</h3>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedCall.client?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Prioridade</h3>
                  <Badge className="mt-1">{getPriorityLabel(selectedCall.priority)}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Status</h3>
                  <Badge variant={getStatusColor(selectedCall.status) as any} className="mt-1">{selectedCall.status}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Data</h3>
                  <p className="text-gray-900 dark:text-white mt-1">{formatDate(selectedCall.createdAt)}</p>
                </div>
              </div>
              <Link href="/calls">
                <Button className="w-full mt-4">Ver Detalhes Completos</Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Serviço */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-2 border-pink-500 shadow-2xl shadow-pink-500/30">
          <DialogHeader>
            <DialogTitle>Detalhes do Serviço</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Nome</h3>
                <p className="text-gray-900 dark:text-white mt-1">{selectedService.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Cliente</h3>
                  <p className="text-gray-900 dark:text-white mt-1">ID: {selectedService.clientId || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Valor</h3>
                  <p className="text-gray-900 dark:text-white mt-1">{formatCurrency(parseFloat(selectedService.basePrice?.toString() || "0"))}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Descrição</h3>
                <p className="text-gray-900 dark:text-white mt-1">{selectedService.description}</p>
              </div>
              <Link href="/services">
                <Button className="w-full mt-4">Ver Detalhes Completos</Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
// Memoized for performance
import { memo } from 'react';
