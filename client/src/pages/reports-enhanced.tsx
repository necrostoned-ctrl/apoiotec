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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Search, FileText, Download, TrendingUp, TrendingDown, Clock, Calendar, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientFilter } from "@/components/ClientFilter";
import type { FinancialTransactionWithClient, Client, User as UserType, Call } from "@shared/schema";

// Função para limpar descrições das transações
const getCleanDescription = (description: string): string => {
  if (!description) return "Transação financeira";
  
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
      !line.startsWith('- ') &&
      line.trim() !== ''
    );
    
    return cleanLines.join(' ').trim() || "Transação financeira";
  }
  
  // For regular descriptions, return first line without truncation
  const firstLine = description.split('\n')[0];
  return firstLine;
};

export default function ReportsEnhanced({ currentUser }: { currentUser?: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<FinancialTransactionWithClient | null>(null);
  const { toast } = useToast();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: calls = [] } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  // Filter valid transactions
  const validTransactions = transactions.filter(t => 
    t && 
    t.id && 
    t.description && 
    t.amount && 
    t.createdAt &&
    !t.parentTransactionId // Exclude installments from main report
  );

  // Apply filters
  const filteredTransactions = validTransactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesUser = userFilter === "all" || transaction.user?.id?.toString() === userFilter;
    const matchesClient = !clientFilter || clientFilter === "all" || transaction.client?.id?.toString() === clientFilter;
    
    const matchesDate = (() => {
      if (dateFilter === "all") return true;
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case "today":
          return transactionDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case "month":
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesType && matchesUser && matchesClient && matchesDate;
  });

  const generatePDFReport = async () => {
    try {
      console.log("=== GERANDO RELATÓRIO ENHANCED ===");
      
      // Import the professional PDF generator
      const { generateFinancialReportPDF } = await import('../utils/professionalPdfGenerator');
      
      console.log("Usando gerador profissional de PDF para relatórios");
      console.log("Transações filtradas:", filteredTransactions.length);
      
      // Preparar informações de filtro para o PDF
      const selectedClient = clients.find(c => c.id?.toString() === clientFilter);
      const periodLabels: Record<string, string> = {
        "all": "Todos os períodos",
        "today": "Hoje",
        "week": "Últimos 7 dias",
        "month": "Este mês"
      };
      
      const filters = {
        clientName: selectedClient?.name || undefined,
        clientId: clientFilter && clientFilter !== "all" ? clientFilter : undefined,
        periodLabel: periodLabels[dateFilter] || dateFilter,
      };
      
      // Use the professional PDF generator with filters
      const result = await generateFinancialReportPDF(filteredTransactions, filters);
      
      if (result) {
        // Download the PDF
        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = result.filename;
        link.click();
      }
      
      toast({
        title: "Sucesso",
        description: "Relatório financeiro baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive",
      });
    }
  };

  const getFilterPeriodText = () => {
    switch (dateFilter) {
      case "today": return "Hoje";
      case "week": return "Últimos 7 dias";
      case "month": return "Este mês";
      default: return "Todos os períodos";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-black">
      <div className="flex items-center justify-between p-4 border-b bg-blue-900 dark:bg-blue-900">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios Financeiros</h1>
          <p className="text-blue-100">Análise detalhada das movimentações financeiras</p>
        </div>
        <Button 
          onClick={generatePDFReport}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={filteredTransactions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {users.map((user: UserType) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.username || user.name || `Usuário ${user.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ClientFilter
            value={clientFilter === "all" ? "" : clientFilter}
            onChange={(value) => setClientFilter(value || "all")}
            placeholder="Filtrar por cliente..."
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'entrada')
                        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
                    )}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {formatCurrency(
                      filteredTransactions
                        .filter(t => t.type === 'saida')
                        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
                    )}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary dark:text-blue-400">Saldo Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(
                      filteredTransactions.reduce((sum, t) => {
                        const value = parseFloat(t.amount.toString());
                        return sum + (t.type === 'entrada' ? value : -value);
                      }, 0)
                    )}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 p-4 overflow-auto">
        <Card className="dark:bg-gray-900 dark:border-green-400/20">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">
              Movimentações Financeiras ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Carregando relatórios...</div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma movimentação encontrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Ajuste os filtros para encontrar as movimentações desejadas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Icon and Main Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "entrada" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                          }`}>
                            {transaction.type === "entrada" ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Building className="h-4 w-4 text-primary dark:text-green-400 flex-shrink-0" />
                              <span className="font-bold text-base text-gray-900 dark:text-white truncate">
                                {transaction.client?.name || "Cliente não identificado"}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                #{transaction.id}
                              </span>
                              <Badge variant={
                                transaction.status === "pago" ? "default" : 
                                transaction.status === "parcial" ? "outline" :
                                transaction.status === "pendente" ? "secondary" : 
                                "destructive"
                              }>
                                {getStatusLabel(transaction.status, transaction)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                              {getCleanDescription(transaction.description || "")}
                            </span>
                            <Badge variant={transaction.type === "entrada" ? "default" : "destructive"} className="flex-shrink-0">
                              {transaction.type === "entrada" ? "Entrada" : "Saída"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                            
                            {transaction.user && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span>{transaction.user.username || transaction.user.name || 'Sistema'}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-base ${
                                transaction.type === "entrada" ? "text-green-600" : "text-red-600"
                              }`}>
                                {transaction.type === "entrada" ? "+" : "-"}
                                {formatCurrency(parseFloat(transaction.amount.toString()))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}