import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Download, Search } from "lucide-react";
import type { FinancialTransactionWithClient, Client, Call, Service } from "@shared/schema";

export default function ReportsDiversos() {
  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [showFilters, setShowFilters] = useState(false);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: calls = [] } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: transactions = [] } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

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
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getPeriodDates();

  const filteredServices = services.filter((s: any) => {
    const serviceDate = new Date(s.createdAt);
    return serviceDate >= startDate && serviceDate <= endDate;
  });

  const filteredCalls = calls.filter((c: any) => {
    const callDate = new Date(c.createdAt);
    return callDate >= startDate && callDate <= endDate;
  });

  const filteredTransactions = transactions.filter((t: any) => {
    const transDate = new Date(t.billingDate || t.date || t.createdAt);
    return transDate >= startDate && transDate <= endDate;
  });

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 space-y-4 md:space-y-6 pb-32">
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/reports">
          <Button
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500/10 h-8 md:h-10 text-xs md:text-sm"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Voltar
          </Button>
        </Link>
        <h2 className="text-xl md:text-3xl font-bold text-orange-400 truncate">Diversos</h2>
      </div>

      {/* Filters Card */}
      <Card className="bg-black border-4 border-orange-500 mb-4 md:mb-6 shadow-lg shadow-orange-500/20">
        <CardHeader className="pb-2 md:pb-3 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="text-base md:text-lg flex items-center gap-2 text-orange-400">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
            Filtros
            <span className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase">
                  Período
                </label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="bg-black border-orange-500 text-orange-400 text-xs md:text-sm">
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
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="bg-black border-4 border-orange-500 overflow-hidden">
          <CardContent className="p-2 md:p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Transações</p>
            <div className="text-xl md:text-2xl font-bold text-orange-400">{filteredTransactions.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black border-4 border-orange-500 overflow-hidden">
          <CardContent className="p-2 md:p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Serviços</p>
            <div className="text-xl md:text-2xl font-bold text-orange-400">{filteredServices.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black border-4 border-orange-500 overflow-hidden">
          <CardContent className="p-2 md:p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Chamados</p>
            <div className="text-xl md:text-2xl font-bold text-orange-400">{filteredCalls.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-black border-4 border-orange-500 overflow-hidden">
          <CardContent className="p-2 md:p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Clientes</p>
            <div className="text-xl md:text-2xl font-bold text-orange-400">{clients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <Card className="bg-black border-4 border-orange-500">
        <CardHeader>
          <CardTitle className="text-orange-400">Transações Financeiras ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Nenhuma transação encontrada</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-500/20">
                    <TableHead className="text-orange-400">Data</TableHead>
                    <TableHead className="text-orange-400">Cliente</TableHead>
                    <TableHead className="text-orange-400">Tipo</TableHead>
                    <TableHead className="text-orange-400 text-right">Valor</TableHead>
                    <TableHead className="text-orange-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: any, index) => (
                    <TableRow key={index} className="border-orange-500/10">
                      <TableCell className="text-sm text-gray-300">{formatDate(new Date(transaction.createdAt))}</TableCell>
                      <TableCell className="font-medium text-gray-300">{transaction.client?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === "entrada" ? "bg-green-500/20 text-green-400 border-green-500" : "bg-red-500/20 text-red-400 border-red-500"}>
                          {transaction.type === "entrada" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold" style={{color: transaction.type === "entrada" ? "#4ade80" : "#ff6b6b"}}>
                        {formatCurrency(parseFloat(transaction.amount.toString()))}
                      </TableCell>
                      <TableCell>
                        <Badge className={transaction.status === "pago" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                          {transaction.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
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
}
