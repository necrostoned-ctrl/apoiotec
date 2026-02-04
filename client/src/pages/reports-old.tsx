import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, FileText, Download, BarChart3, PieChart, TrendingUp, Users, User, Calendar } from "lucide-react";
import type { CallWithClient, FinancialTransactionWithClient, Client } from "@shared/schema";
import { generateFinancialReport } from "@/utils/simplePdfGenerator";

export default function Reports() {
  const [reportType, setReportType] = useState("financeiro");
  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [clientFilter, setClientFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [groupBy, setGroupBy] = useState("cliente");

  const { data: calls = [], isLoading: callsLoading } = useQuery<CallWithClient[]>({
    queryKey: ["/api/calls"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Calculate period dates
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getPeriodDates = () => {
    switch (periodFilter) {
      case "este-mes":
        return { start: thisMonth, end: now };
      case "mes-passado":
        return { start: lastMonth, end: thisMonth };
      case "este-ano":
        return { start: thisYear, end: now };
      case "ultimos-30-dias":
        return { start: last30Days, end: now };
      default:
        return { start: thisMonth, end: now };
    }
  };

  const { start, end } = getPeriodDates();

  // Filter data by period and additional filters
  const filteredData = {
    transactions: transactions.filter(transaction => {
      // Filtros críticos para dados excluídos/inválidos
      if (!transaction || !transaction.id) return false;
      if (!transaction.description || transaction.description.trim() === '') return false;
      if (!transaction.amount || parseFloat(transaction.amount.toString()) <= 0) return false;
      if (transaction.clientId && !transaction.client) return false; // Cliente foi excluído mas transação ainda tem referência
      
      const transactionDate = new Date(transaction.createdAt);
      const matchesPeriod = transactionDate >= start && transactionDate <= end;
      const matchesClient = !clientFilter || clientFilter === "todos" || transaction.clientId?.toString() === clientFilter;
      const matchesUser = !userFilter || userFilter === "todos" || 
        transaction.userId?.toString() === userFilter || 
        transaction.completedByUserId?.toString() === userFilter;
      const matchesDate = !dateFilter || (() => {
        const filterDate = new Date(dateFilter);
        return transactionDate.toDateString() === filterDate.toDateString();
      })();
      return matchesPeriod && matchesClient && matchesUser && matchesDate;
    }),
    calls: calls.filter(call => {
      // Filtros críticos para dados excluídos/inválidos
      if (!call || !call.id) return false;
      if (!call.service || call.service.trim() === '') return false;
      if (call.clientId && !call.client) return false; // Cliente foi excluído mas chamado ainda tem referência
      
      const callDate = new Date(call.createdAt);
      const matchesPeriod = callDate >= start && callDate <= end;
      const matchesClient = !clientFilter || clientFilter === "todos" || call.clientId?.toString() === clientFilter;
      const matchesDate = !dateFilter || (() => {
        const filterDate = new Date(dateFilter);
        return callDate.toDateString() === filterDate.toDateString();
      })();
      return matchesPeriod && matchesClient && matchesDate;
    })
  };

  // Group financial data by client
  const getFinancialDataByClient = () => {
    const clientData = new Map();

    filteredData.transactions.forEach(transaction => {
      const clientName = transaction.client?.name || "Sem Cliente";
      const clientId = transaction.client?.id || 0;

      if (!clientData.has(clientId)) {
        clientData.set(clientId, {
          clientName,
          totalEntradas: 0,
          totalSaidas: 0,
          transacoesCount: 0,
          chamadosCount: 0,
        });
      }

      const data = clientData.get(clientId);
      const amount = parseFloat(transaction.amount.toString());

      if (transaction.type === "entrada") {
        data.totalEntradas += amount;
      } else {
        data.totalSaidas += amount;
      }
      data.transacoesCount++;
    });

    // Add calls count per client
    filteredData.calls.forEach(call => {
      // Ignorar chamados sem cliente válido
      if (!call.client || !call.client.id) return;
      
      const clientId = call.client.id;
      if (clientData.has(clientId)) {
        clientData.get(clientId).chamadosCount++;
      } else {
        clientData.set(clientId, {
          clientName: call.client.name,
          totalEntradas: 0,
          totalSaidas: 0,
          transacoesCount: 0,
          chamadosCount: 1,
        });
      }
    });

    return Array.from(clientData.values()).sort((a, b) => 
      (b.totalEntradas - b.totalSaidas) - (a.totalEntradas - a.totalSaidas)
    );
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalEntradas = filteredData.transactions
      .filter(t => t.type === "entrada")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalSaidas = filteredData.transactions
      .filter(t => t.type === "saida")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const saldoLiquido = totalEntradas - totalSaidas;

    const totalChamados = filteredData.calls.length;
    const chamadosConcluidos = filteredData.calls.filter(c => c.status === "concluido").length;
    const chamadosAndamento = filteredData.calls.filter(c => c.status === "em_andamento").length;

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      totalChamados,
      chamadosConcluidos,
      chamadosAndamento,
    };
  };

  const summaryStats = getSummaryStats();
  const clientData = getFinancialDataByClient();

  const exportToCSV = () => {
    const headers = ["Cliente", "Entradas", "Saídas", "Saldo", "Transações", "Chamados"];
    const csvData = [
      headers.join(","),
      ...clientData.map(row => [
        row.clientName,
        row.totalEntradas.toFixed(2),
        row.totalSaidas.toFixed(2),
        (row.totalEntradas - row.totalSaidas).toFixed(2),
        row.transacoesCount,
        row.chamadosCount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-financeiro-${periodFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const exportToPDF = () => {
    console.log("=== GERANDO RELATÓRIO FINANCEIRO SIMPLIFICADO ===");
    try {
      // Usar o gerador simplificado
      generateFinancialReport(filteredData.transactions || []);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar relatório PDF");
    }
  };
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  .header { text-align: center; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Relatório Financeiro - Apoiotec Informática</h1>
                  <p>Data: ${formatDate(now)}</p>
                  ${clientFilter ? `<p>Cliente: ${clients.find((c: any) => c.id.toString() === clientFilter)?.name || 'N/A'}</p>` : ''}
                  ${dateFilter ? `<p>Data filtrada: ${new Date(dateFilter).toLocaleDateString('pt-BR')}</p>` : ''}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(filteredData.transactions || []).map((transaction: any) => `
                      <tr>
                        <td>${formatDate(new Date(transaction.createdAt))}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.client?.name || 'N/A'}</td>
                        <td>${transaction.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
                        <td>${formatCurrency(parseFloat(transaction.amount.toString()))}</td>
                        <td>${transaction.status}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `;
        }
      } else {
        // Relatório de chamados
        if (reportTemplate) {
          const callsTable = (filteredData.calls || []).map((call: any) => `
            <tr>
              <td>${formatDate(new Date(call.createdAt))}</td>
              <td>${call.client.name}</td>
              <td>${call.equipment}</td>
              <td>${call.serviceType}</td>
              <td>${call.status}</td>
              <td>${call.priority}</td>
            </tr>
          `).join('');
          
          content = reportTemplate.content
            .replace(/\{\{empresa\}\}/g, reportTemplate.companyName || 'Apoiotec Informática')
            .replace(/\{\{periodo\}\}/g, clientFilter ? `Cliente: ${clients.find((c: any) => c.id.toString() === clientFilter)?.name || 'N/A'}` : `Data: ${formatDate(now)}`)
            .replace(/\{\{chamados\}\}/g, callsTable)
            .replace(/\{\{data\}\}/g, formatDate(now))
            .replace(/\{\{hora\}\}/g, now.toLocaleTimeString('pt-BR'));
            
          if (reportTemplate.logoUrl) {
            content = content.replace(/\{\{logo\}\}/g, `<img src="${reportTemplate.logoUrl}" style="max-width: 200px; margin-bottom: 20px;" />`);
          } else {
            content = content.replace(/\{\{logo\}\}/g, '');
          }
          
          if (!content.includes('<html')) {
            content = `
              <html>
                <head>
                  <title>Relatório de Chamados - ${reportTemplate.companyName || 'Apoiotec Informática'}</title>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { text-align: center; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  ${content}
                </body>
              </html>
            `;
          }
        } else {
          // Template padrão de chamados
          content = `
            <html>
              <head>
                <title>Relatório de Chamados</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  .header { text-align: center; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Relatório de Chamados - Apoiotec Informática</h1>
                  <p>Data: ${formatDate(now)}</p>
                  ${clientFilter ? `<p>Cliente: ${clients.find((c: any) => c.id.toString() === clientFilter)?.name || 'N/A'}</p>` : ''}
                  ${dateFilter ? `<p>Data filtrada: ${new Date(dateFilter).toLocaleDateString('pt-BR')}</p>` : ''}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Cliente</th>
                      <th>Equipamento</th>
                      <th>Serviço</th>
                      <th>Status</th>
                      <th>Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(filteredData.calls || []).map((call: any) => `
                      <tr>
                        <td>${formatDate(new Date(call.createdAt))}</td>
                        <td>${call.client.name}</td>
                        <td>${call.equipment}</td>
                        <td>${call.serviceType}</td>
                        <td>${call.status}</td>
                        <td>${call.priority}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `;
        }
      }
      
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      
      // Fallback para método antigo
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        let content = '';
        
        if (reportType === "financeiro") {
          content = `
            <html>
              <head>
                <title>Relatório Financeiro</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  .header { text-align: center; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Relatório Financeiro - Apoiotec Informática</h1>
                  <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(filteredData.transactions || []).map((transaction: any) => `
                      <tr>
                        <td>${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.client?.name || 'N/A'}</td>
                        <td>${transaction.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
                        <td>${transaction.amount}</td>
                        <td>${transaction.status}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `;
        }
        
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">Relatórios</h2>
          <p className="text-cyan-100">Análises detalhadas e exportação de dados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} className="bg-primary">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de relatório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
            <SelectItem value="chamados">Relatório de Chamados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os usuários</SelectItem>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-10"
            placeholder="Filtrar por data"
          />
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            setDateFilter("");
            setClientFilter("todos");
          }}
        >
          Limpar Filtros
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Entradas</p>
                <p className="text-3xl font-bold">{formatCurrency(summaryStats.totalEntradas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Total Saídas</p>
                <p className="text-3xl font-bold">{formatCurrency(summaryStats.totalSaidas)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-200 rotate-180" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${summaryStats.saldoLiquido >= 0 ? 'from-blue-500 to-blue-600' : 'from-yellow-500 to-yellow-600'} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Saldo Líquido</p>
                <p className="text-3xl font-bold">{formatCurrency(summaryStats.saldoLiquido)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros e Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="este-mes">Este Mês</SelectItem>
                  <SelectItem value="mes-passado">Mês Passado</SelectItem>
                  <SelectItem value="ultimos-30-dias">Últimos 30 Dias</SelectItem>
                  <SelectItem value="este-ano">Este Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
                  <SelectItem value="chamados">Relatório de Chamados</SelectItem>
                  <SelectItem value="combinado">Relatório Combinado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agrupar Por</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="periodo">Período</SelectItem>
                  <SelectItem value="tipo">Tipo de Transação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Cliente</label>
              <Search className="absolute left-3 top-10 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nome do cliente..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Relatório por Cliente - {periodFilter.replace("-", " ").toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callsLoading || transactionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-cyan-100">Carregando dados...</p>
            </div>
          ) : clientData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-cyan-100">Nenhum dado encontrado para o período selecionado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-center">Transações</TableHead>
                    <TableHead className="text-center">Chamados</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.map((data, index) => {
                    const saldo = data.totalEntradas - data.totalSaidas;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.clientName}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(data.totalEntradas)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {formatCurrency(data.totalSaidas)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${saldo >= 0 ? 'text-primary' : 'text-yellow-600'}`}>
                          {formatCurrency(saldo)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{data.transacoesCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{data.chamadosCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={saldo >= 0 ? "default" : "destructive"}>
                            {saldo >= 0 ? "Positivo" : "Negativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de Chamados:</span>
                <Badge>{summaryStats.totalChamados}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Concluídos:</span>
                <Badge variant="default">{summaryStats.chamadosConcluidos}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Em Andamento:</span>
                <Badge variant="secondary">{summaryStats.chamadosAndamento}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Conclusão:</span>
                <span className="font-medium">
                  {summaryStats.totalChamados > 0 
                    ? Math.round((summaryStats.chamadosConcluidos / summaryStats.totalChamados) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ticket Médio:</span>
                <span className="font-medium">
                  {filteredData.transactions.length > 0
                    ? formatCurrency(summaryStats.totalEntradas / filteredData.transactions.filter(t => t.type === "entrada").length || 0)
                    : "R$ 0,00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Margem:</span>
                <span className={`font-medium ${summaryStats.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.totalEntradas > 0
                    ? Math.round((summaryStats.saldoLiquido / summaryStats.totalEntradas) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clientes Ativos:</span>
                <Badge>{clientData.filter(c => c.totalEntradas > 0).length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Período Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Início:</span>
                <span className="font-medium">{formatDate(start)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fim:</span>
                <span className="font-medium">{formatDate(end)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dias:</span>
                <span className="font-medium">
                  {Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}