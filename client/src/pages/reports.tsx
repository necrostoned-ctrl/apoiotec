import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Users,
  Package,
  AlertCircle,
  DollarSign,
  CreditCard,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientFilter } from "@/components/ClientFilter";
import { generateFinancialReportPDF } from "@/utils/professionalPdfGenerator";
import { PDFViewer } from "@/components/PDFViewer";
import type { FinancialTransactionWithClient, Client, Call, Service } from "@shared/schema";

export default function Reports() {
  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [clientFilter, setClientFilter] = useState("");
  const [reportType, setReportType] = useState("financeiro");
  const [showFilters, setShowFilters] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);

  const reportColors: Record<string, { border: string; title: string }> = {
    financeiro: { border: "border-green-500", title: "text-green-400" },
    chamados: { border: "border-yellow-400", title: "text-yellow-400" },
    servicos: { border: "border-blue-500", title: "text-blue-400" }
  };

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<
    FinancialTransactionWithClient[]
  >({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: calls = [] } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Get period dates
  const getPeriodDates = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (periodFilter) {
      case "hoje":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "esta-semana":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "este-mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "mes-passado":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "ultimo-trimestre":
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      case "este-ano":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "todos-os-periodos":
        startDate = new Date(1970, 0, 1);
        endDate = new Date(now);
        break;
      default:
        startDate = new Date(0);
    }

    return { startDate, endDate };
  };

  // Filter transactions - INTELIGENTE: usar paidAt para pagas, createdAt para pendentes
  const getFilteredTransactions = () => {
    const { startDate, endDate } = getPeriodDates();

    return transactions.filter((t: any) => {
      let transactionDate;
      if (t.status === "pago" && t.paidAt) {
        // Para transações PAGAS, usar data de pagamento
        transactionDate = new Date(t.paidAt);
      } else {
        // Para transações PENDENTES, usar data de criação
        transactionDate = new Date(t.createdAt);
      }
      const withinPeriod = transactionDate >= startDate && transactionDate <= endDate;
      const matchesClient =
        !clientFilter ||
        clientFilter === "todos" ||
        (t.client && t.client.id.toString() === clientFilter);

      return withinPeriod && matchesClient;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate summary - APENAS VALORES RECEBIDOS (pago)
  const getSummary = () => {
    const totalEntradas = filteredTransactions
      .filter((t) => t.type === "entrada" && t.status === "pago")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalSaidas = filteredTransactions
      .filter((t) => t.type === "saida" && t.status === "pago")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalPago = totalEntradas;

    const totalPendente = filteredTransactions
      .filter((t) => t.type === "entrada" && (t.status === "pendente" || t.status === "parcial"))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido: totalEntradas - totalSaidas,
      totalTransactions: filteredTransactions.filter((t) => t.type === "entrada" && t.status === "pago").length,
      totalPago,
      totalPendente,
    };
  };

  // Generate chart data - Financeiro (APENAS VALORES RECEBIDOS - pago)
  const getFinanceChartData = () => {
    const data: Record<string, any> = {};

    filteredTransactions.forEach((t: any) => {
      if (t.status === "pago") {
        const date = new Date(t.createdAt).toLocaleDateString("pt-BR");
        if (!data[date]) {
          data[date] = { date, entrada: 0, saida: 0 };
        }
        const amount = parseFloat(t.amount.toString());
        if (t.type === "entrada") {
          data[date].entrada += amount;
        } else {
          data[date].saida += amount;
        }
      }
    });

    return Object.values(data).sort(
      (a: any, b: any) =>
        new Date(a.date.split("/").reverse().join("-")).getTime() -
        new Date(b.date.split("/").reverse().join("-")).getTime()
    );
  };

  // Generate chart data - Status (apenas ENTRADAS)
  const getStatusChartData = () => {
    const data = {
      pago: 0,
      pendente: 0,
      parcial: 0,
    };

    filteredTransactions.forEach((t: any) => {
      if (t.type === "entrada") {
        if (t.status === "pago") {
          data.pago += parseFloat(t.amount.toString());
        } else if (t.status === "pendente") {
          data.pendente += parseFloat(t.amount.toString());
        } else if (t.status === "parcial") {
          data.parcial += parseFloat(t.amount.toString());
        }
      }
    });

    return [
      { name: "Pago", value: data.pago },
      { name: "Pendente", value: data.pendente },
      { name: "Parcial", value: data.parcial },
    ].filter((item) => item.value > 0);
  };

  // Generate chart data - Top Clientes (apenas ENTRADAS PAGAS)
  const getTopClientsData = () => {
    const data: Record<string, number> = {};

    filteredTransactions.forEach((t: any) => {
      if (t.type === "entrada" && t.status === "pago") {
        const clientName = t.client?.name || "Não identificado";
        const amount = parseFloat(t.amount.toString());
        data[clientName] = (data[clientName] || 0) + amount;
      }
    });

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Relatórios por tipo
  const renderFinanceiroReport = () => {
    const summary = getSummary();
    const chartData = getFinanceChartData();
    const statusData = getStatusChartData();
    const topClients = getTopClientsData();

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black border-4 border-green-500 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Total Entradas
                    </p>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(summary.totalEntradas)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {filteredTransactions.filter((t) => t.type === "entrada").length} transações
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-red-500 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Total Saídas
                    </p>
                    <div className="text-2xl font-bold text-red-400">
                      {formatCurrency(summary.totalSaidas)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {filteredTransactions.filter((t) => t.type === "saida").length} transações
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Saldo Líquido
                    </p>
                    <div
                      className={`text-2xl font-bold ${summary.saldoLiquido >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatCurrency(summary.saldoLiquido)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Resultado</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-purple-500 overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      A Receber
                    </p>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatCurrency(summary.totalPendente)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Em aberto</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-500 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black border-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-400">Fluxo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="entrada"
                    stroke="#10b981"
                    name="Entradas"
                  />
                  <Line
                    type="monotone"
                    dataKey="saida"
                    stroke="#ef4444"
                    name="Saídas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-green-400">Status de Pagamentos</CardTitle>
              <p className="text-xs text-gray-400 mt-1">Período: {periodFilter === "hoje" ? "Hoje" : periodFilter === "esta-semana" ? "Esta semana" : periodFilter === "este-mes" ? "Este mês" : periodFilter === "mes-passado" ? "Mês passado" : periodFilter === "ultimo-trimestre" ? "Último trimestre" : periodFilter === "este-ano" ? "Este ano" : periodFilter === "todos-os-periodos" ? "Todos os períodos" : ""}</p>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma transação no período selecionado</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Clients */}
        <Card className="bg-black border-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-400">Top 5 Clientes por Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={480}>
              <BarChart data={topClients} layout="vertical" margin={{ left: 220, right: 30, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={210} tick={{ fontSize: 18, fontWeight: 600, fill: "currentColor" }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-black border-4 border-green-500 shadow-lg shadow-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-400 flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /> Transações Detalhadas</CardTitle>
            <Button
              size="sm"
              onClick={async () => {
                const pdf = await generateFinancialReportPDF(filteredTransactions);
                if (pdf) {
                  setPdfData(pdf);
                  setShowPDFDialog(true);
                }
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Gerar PDF
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando dados...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-slate-700">
                      <TableHead className="w-20">Data</TableHead>
                      <TableHead className="w-32">Cliente</TableHead>
                      <TableHead className="w-16">Tipo</TableHead>
                      <TableHead className="w-24">Valor</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="flex-1">Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any, index) => (
                      <TableRow key={index} className="border-gray-200 dark:border-slate-700">
                        <TableCell className="text-sm w-20">
                          {formatDate(new Date(transaction.createdAt))}
                        </TableCell>
                        <TableCell className="font-medium text-sm w-32 truncate">
                          {transaction.client?.name || "N/A"}
                        </TableCell>
                        <TableCell className="w-16">
                          <Badge
                            variant={transaction.type === "entrada" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {transaction.type === "entrada" ? "ENT" : "SÍD"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`font-semibold text-sm w-24 text-right ${transaction.type === "entrada" ? "text-green-400" : "text-red-400"}`}
                        >
                          {formatCurrency(parseFloat(transaction.amount.toString()))}
                        </TableCell>
                        <TableCell className="w-20">
                          <Badge
                            variant={transaction.status === "pago" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {transaction.status?.substring(0, 3).toUpperCase() || "PND"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {transaction.description
                            ? transaction.description.substring(0, 100)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderServicesReport = () => {
    const { startDate, endDate } = getPeriodDates();

    const filteredServices = services.filter((s: any) => {
      const serviceDate = new Date(s.createdAt);
      const withinPeriod = serviceDate >= startDate && serviceDate <= endDate;
      return withinPeriod;
    });

    const totalByCategory: Record<string, number> = {};
    filteredServices.forEach((s: any) => {
      const category = s.category || "Sem categoria";
      totalByCategory[category] = (totalByCategory[category] || 0) + 1;
    });

    const categoryData = Object.entries(totalByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black border-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Total Serviços
                </p>
                <div className="text-2xl font-bold text-blue-400">{filteredServices.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Categorias
                </p>
                <div className="text-2xl font-bold text-green-400">
                  {Object.keys(totalByCategory).length}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-blue-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Período
                </p>
                <div className="text-2xl font-bold text-purple-400">
                  {startDate.toLocaleDateString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-4 border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2"><Package className="h-5 w-5 text-blue-500" /> Serviços por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
                        index % 5
                      ]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black border-4 border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2"><Package className="h-5 w-5 text-blue-500" /> Lista de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Data</TableHead>
                    <TableHead className="flex-1">Nome</TableHead>
                    <TableHead className="w-28">Categoria</TableHead>
                    <TableHead className="w-24 text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm w-20">{formatDate(new Date(service.createdAt))}</TableCell>
                      <TableCell className="font-medium flex-1">{service.name}</TableCell>
                      <TableCell className="w-28 text-sm">{service.category || "-"}</TableCell>
                      <TableCell className="text-right font-semibold w-24">{formatCurrency(parseFloat(service.basePrice || "0"))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCallsReport = () => {
    const { startDate, endDate } = getPeriodDates();

    const filteredCalls = calls.filter((c: any) => {
      const callDate = new Date(c.createdAt);
      const withinPeriod = callDate >= startDate && callDate <= endDate;
      return withinPeriod;
    });

    const statusCount = {
      aguardando: 0,
      em_atendimento: 0,
      concluido: 0,
      cancelado: 0,
    };

    const priorityCount = {
      baixa: 0,
      media: 0,
      alta: 0,
    };

    filteredCalls.forEach((c: any) => {
      statusCount[c.status as keyof typeof statusCount]++;
      priorityCount[c.priority as keyof typeof priorityCount]++;
    });

    const statusData = Object.entries(statusCount)
      .map(([name, value]) => ({ name: name.replace("_", " "), value }))
      .filter((item) => item.value > 0);

    const priorityData = Object.entries(priorityCount)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black border-4 border-yellow-400 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Total Chamados
                </p>
                <div className="text-2xl font-bold text-yellow-400">{filteredCalls.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-yellow-400 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Concluídos
                </p>
                <div className="text-2xl font-bold text-green-400">{statusCount.concluido}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-yellow-400 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Em Atendimento
                </p>
                <div className="text-2xl font-bold text-orange-400">
                  {statusCount.em_atendimento}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-yellow-400 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Aguardando
                </p>
                <div className="text-2xl font-bold text-red-400">{statusCount.aguardando}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black border-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2"><FileText className="h-5 w-5 text-yellow-500" /> Chamados por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#2563eb", "#10b981", "#f59e0b", "#ef4444"][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2"><FileText className="h-5 w-5 text-yellow-500" /> Chamados por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-4 border-green-500">
          <CardHeader>
            <CardTitle>Chamados Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Data</TableHead>
                    <TableHead className="flex-1">Equipamento</TableHead>
                    <TableHead className="w-24">Tipo</TableHead>
                    <TableHead className="w-20">Prior.</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.slice(0, 10).map((call: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm w-20">{formatDate(new Date(call.createdAt))}</TableCell>
                      <TableCell className="font-medium flex-1 truncate">{call.equipment}</TableCell>
                      <TableCell className="text-sm w-24">{call.serviceType}</TableCell>
                      <TableCell className="w-20">
                        <Badge
                          variant={
                            call.priority === "alta"
                              ? "destructive"
                              : call.priority === "media"
                                ? "secondary"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {call.priority.substring(0, 3).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-24">
                        <Badge
                          variant={
                            call.status === "concluido"
                              ? "default"
                              : call.status === "cancelado"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {call.status.substring(0, 3).toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderClientsReport = () => {
    const activeClients = clients.filter((c: any) => c.status === "ativo");
    const inactiveClients = clients.filter((c: any) => c.status !== "ativo");

    // Clientes com mais transações
    const clientTransactionCounts: Record<string, number> = {};
    transactions.forEach((t: any) => {
      if (t.client) {
        clientTransactionCounts[t.client.id] =
          (clientTransactionCounts[t.client.id] || 0) + 1;
      }
    });

    const topClientsByTransactions = Object.entries(clientTransactionCounts)
      .map(([clientId, count]) => {
        const client = clients.find((c: any) => c.id.toString() === clientId);
        return { name: client?.name || "N/A", value: count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black border-4 border-purple-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Total Clientes
                </p>
                <div className="text-2xl font-bold text-purple-400">{clients.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-purple-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Ativos
                </p>
                <div className="text-2xl font-bold text-green-400">{activeClients.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-purple-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Inativos
                </p>
                <div className="text-2xl font-bold text-red-400">{inactiveClients.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-4 border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2"><Users className="h-5 w-5 text-purple-500" /> Top 5 Clientes por Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClientsByTransactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" name="Transações" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black border-4 border-purple-500">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center gap-2"><Users className="h-5 w-5 text-purple-500" /> Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Data</TableHead>
                    <TableHead className="flex-1">Nome</TableHead>
                    <TableHead className="w-32">Email</TableHead>
                    <TableHead className="w-24">Telefone</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm w-20">{formatDate(new Date(client.createdAt))}</TableCell>
                      <TableCell className="font-medium flex-1">{client.name}</TableCell>
                      <TableCell className="text-sm w-32 truncate">{client.email || "-"}</TableCell>
                      <TableCell className="text-sm w-24">{client.phone || "-"}</TableCell>
                      <TableCell className="w-20">
                        <Badge variant="outline" className={`${getStatusColor(client.status === "ativo" ? "concluido" : "cancelado")} text-xs border font-semibold`}>
                          {client.status.substring(0, 1).toUpperCase() + client.status.substring(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPaymentDelayedReport = () => {
    const delayedTransactions = filteredTransactions.filter(
      (t: any) =>
        (t.status === "pendente" || t.status === "parcial") &&
        new Date(t.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const totalDelayed = delayedTransactions.reduce(
      (sum, t: any) => sum + parseFloat(t.amount.toString()),
      0
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-black border-4 border-green-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Pagamentos Atrasados
                </p>
                <div className="text-2xl font-bold text-red-400">{delayedTransactions.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-4 border-green-500 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  Valor em Atraso
                </p>
                <div className="text-2xl font-bold text-orange-400">
                  {formatCurrency(totalDelayed)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-4 border-green-500 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Transações com Atraso (mais de 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {delayedTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum pagamento atrasado</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Data</TableHead>
                      <TableHead className="flex-1">Cliente</TableHead>
                      <TableHead className="w-24 text-right">Valor</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-20 text-center">Dias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delayedTransactions.map((transaction: any, index) => {
                      const daysDelayed = Math.floor(
                        (Date.now() - new Date(transaction.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={index}>
                          <TableCell className="text-sm w-20">
                            {formatDate(new Date(transaction.createdAt))}
                          </TableCell>
                          <TableCell className="font-medium flex-1">
                            {transaction.client?.name || "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold text-red-400 text-right w-24">
                            {formatCurrency(parseFloat(transaction.amount.toString()))}
                          </TableCell>
                          <TableCell className="w-20">
                            <Badge variant="outline" className={`${getStatusColor(transaction.status)} text-xs border font-semibold`}>{getStatusLabel(transaction.status)}</Badge>
                          </TableCell>
                          <TableCell className="font-bold text-red-400 text-center w-20">{daysDelayed}d</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-8 pb-32">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-2">Central de Relatórios</h2>
        <p className="text-gray-400">
          Selecione o tipo de relatório que desejas
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link href="/reports/cliente">
          <Card className="bg-black border-4 border-purple-500 cursor-pointer hover:shadow-lg hover:shadow-purple-500/30 transition-all h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-400 flex items-center gap-2 text-sm md:text-base">
                <Users className="h-5 w-5 text-purple-500" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-gray-400 text-xs line-clamp-1">Dados e histórico por cliente</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/diversos">
          <Card className="bg-black border-4 border-orange-500 cursor-pointer hover:shadow-lg hover:shadow-orange-500/30 transition-all h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-400 flex items-center gap-2 text-sm md:text-base">
                <FileText className="h-5 w-5 text-orange-500" />
                Diversos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-gray-400 text-xs line-clamp-1">Relatórios gerais e totalizadores</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-black border-4 border-blue-500 opacity-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 flex items-center gap-2 text-sm md:text-base">
              <Package className="h-5 w-5 text-blue-500" />
              Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-gray-400 text-xs line-clamp-1">Análise de serviços e rentabilidade</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="bg-black border-4 border-green-500 mb-6 shadow-lg shadow-green-500/20">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="text-lg flex items-center gap-2 text-green-400">
            <Search className="h-5 w-5 text-green-500" />
            Filtros
            <span className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
          </CardTitle>
        </CardHeader>
        {showFilters && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase">
                Período
              </label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="esta-semana">Esta semana</SelectItem>
                  <SelectItem value="este-mes">Este mês</SelectItem>
                  <SelectItem value="mes-passado">Mês passado</SelectItem>
                  <SelectItem value="ultimo-trimestre">Último trimestre</SelectItem>
                  <SelectItem value="este-ano">Este ano</SelectItem>
                  <SelectItem value="todos-os-periodos">Todos os Períodos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase">
                Cliente
              </label>
              <ClientFilter
                value={clientFilter}
                onChange={setClientFilter}
                placeholder="Todos os clientes"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase">
                Ação
              </label>
              <Button
                className="w-full"
                onClick={() => {
                  const headers = [
                    "Data",
                    "Cliente",
                    "Tipo",
                    "Valor",
                    "Status",
                    "Descrição",
                  ];
                  const csvData = [
                    headers.join(","),
                    ...filteredTransactions.map((t: any) => [
                      formatDate(new Date(t.createdAt)),
                      t.client?.name || "N/A",
                      t.type,
                      parseFloat(t.amount.toString()).toFixed(2),
                      t.status,
                      (t.description || "")
                        .replace(/,/g, ";")
                        .substring(0, 50),
                    ]),
                  ].join("\n");

                  const blob = new Blob([csvData], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute(
                    "download",
                    `relatorio-${new Date().toISOString().split("T")[0]}.csv`
                  );
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Tabs for different reports */}
      <Tabs value={reportType} onValueChange={setReportType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-transparent border-0 p-2 gap-2 mb-0 relative z-20">
          <TabsTrigger value="financeiro" className="flex items-center justify-center gap-2 bg-black border-4 border-green-500 rounded-lg text-green-400 hover:bg-green-500/10 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 transition-all py-3">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-sm font-semibold">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="servicos" className="flex items-center justify-center gap-2 bg-black border-4 border-blue-500 rounded-lg text-blue-400 hover:bg-blue-500/10 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 transition-all py-3">
            <Package className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold">Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="chamados" className="flex items-center justify-center gap-2 bg-black border-4 border-yellow-500 rounded-lg text-yellow-400 hover:bg-yellow-500/10 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300 transition-all py-3">
            <FileText className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-semibold">Chamados</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center justify-center gap-2 bg-black border-4 border-purple-500 rounded-lg text-purple-400 hover:bg-purple-500/10 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 transition-all py-3">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-semibold">Clientes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="mt-24">
          {renderFinanceiroReport()}
        </TabsContent>
        <TabsContent value="servicos" className="mt-24">
          {renderServicesReport()}
        </TabsContent>
        <TabsContent value="chamados" className="mt-24">
          {renderCallsReport()}
        </TabsContent>
        <TabsContent value="clientes" className="mt-24">
          {renderClientsReport()}
        </TabsContent>

        {/* Pagamentos Atrasados - como tab extra */}
        <div className="mt-6">
          <Card className="bg-black border-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Pagamentos Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent>{renderPaymentDelayedReport()}</CardContent>
          </Card>
        </div>
      </Tabs>

      {/* PDF Viewer Dialog */}
      {pdfData && (
        <PDFViewer 
          open={showPDFDialog}
          onOpenChange={setShowPDFDialog}
          pdfDataUrl={pdfData.dataUrl}
          filename={pdfData.filename}
        />
      )}
    </div>
  );
}
