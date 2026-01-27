import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, Clock, DollarSign, Receipt, Filter } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getCleanDescription } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialTransaction, Client, User as UserType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ClientFilter } from "@/components/ClientFilter";

export default function FinancialPage() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [completedByFilter, setCompletedByFilter] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<FinancialTransaction[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  // Safe filtering with comprehensive error handling
  const filteredTransactions = useMemo(() => {
    try {
      if (!Array.isArray(transactions)) {
        console.warn("Transactions não é um array:", transactions);
        return [];
      }

      console.log("=== FILTRO SEGURO ===");
      console.log("Total transactions:", transactions.length);
      console.log("Client filter:", clientFilter);

      return transactions.filter((transaction) => {
        try {
          // Basic validation
          if (!transaction || typeof transaction !== 'object') {
            return false;
          }

          if (!transaction.id || !transaction.description || !transaction.amount) {
            return false;
          }

          // Type filter
          const matchesType = !typeFilter || typeFilter === "todos" || transaction.type === typeFilter;

          // Client filter - SAFE IMPLEMENTATION
          let matchesClient = true;
          if (clientFilter && clientFilter !== "todos" && clientFilter !== "") {
            matchesClient = false; // Default to false when filtering
            
            try {
              if (transaction.client && 
                  typeof transaction.client === 'object' && 
                  transaction.client.id !== null && 
                  transaction.client.id !== undefined) {
                
                const transactionClientId = String(transaction.client.id);
                const filterClientId = String(clientFilter);
                matchesClient = transactionClientId === filterClientId;
                
                console.log("Client match:", {
                  transactionId: transaction.id,
                  transactionClientId,
                  filterClientId,
                  matches: matchesClient
                });
              }
            } catch (clientError) {
              console.error("Error in client filter:", clientError);
              matchesClient = false;
            }
          }

          // Status filter
          const matchesStatus = !statusFilter || statusFilter === "todos" || transaction.status === statusFilter;

          // User filter
          const matchesUser = !filterUser || filterUser === "todos" || 
            (transaction.userId && String(transaction.userId) === filterUser) ||
            (transaction.completedByUserId && String(transaction.completedByUserId) === filterUser);

          // Completed by filter
          const matchesCompletedBy = !completedByFilter || completedByFilter === "todos" || 
            (completedByFilter === "sem-usuario" ? !transaction.completedByUserId : 
             transaction.completedByUserId && users.find(u => u.id === transaction.completedByUserId)?.username === completedByFilter);

          return matchesType && matchesClient && matchesStatus && matchesUser && matchesCompletedBy;

        } catch (transactionError) {
          console.error("Error filtering transaction:", transactionError, transaction);
          return false;
        }
      });

    } catch (filterError) {
      console.error("Critical error in filter:", filterError);
      return transactions || []; // Return unfiltered on error
    }
  }, [transactions, typeFilter, clientFilter, statusFilter, filterUser, completedByFilter, users]);

  // Calculate financial stats safely
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyIncome = transactions
    .filter(t => t.type === "entrada" && t.status === "pago" && new Date(t.createdAt) >= thisMonth)
    .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

  const monthlyExpenses = transactions
    .filter(t => t.type === "saida" && t.status === "pago" && new Date(t.createdAt) >= thisMonth)
    .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

  const pendingReceivables = transactions
    .filter(t => t.type === "entrada" && t.status === "pendente")
    .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h2>
          <p className="text-gray-600">Controle de entradas, saídas e pendências financeiras</p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Entradas do Mês</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Saídas do Mês</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pendências</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingReceivables)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cliente</label>
              <ClientFilter
                value={clientFilter}
                onChange={setClientFilter}
                placeholder="Filtrar por cliente..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Transações ({filteredTransactions.length})
        </h3>
        
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhuma transação encontrada com os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          className={`${getStatusColor(transaction.status)} text-white`}
                        >
                          {getStatusLabel(transaction.status)}
                        </Badge>
                        <Badge variant={transaction.type === "entrada" ? "default" : "destructive"}>
                          {transaction.type === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                        {transaction.client && (
                          <span className="text-sm text-gray-600">
                            Cliente: {transaction.client.name}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-lg mb-1">
                        {getCleanDescription(transaction.description)}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(transaction.createdAt)}</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(parseFloat(String(transaction.amount)))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}