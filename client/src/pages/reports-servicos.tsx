import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Download, ArrowLeft } from "lucide-react";
import { generateServiceReportPDF } from "@/utils/pdfGenerator";
import type { Service, Client } from "@shared/schema";

export default function ReportsServicos() {
  console.log("🔵 [REPORTS-SERVICOS] Página CARREGADA");
  
  const [clientId, setClientId] = useState<string>("todos");
  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("todos");

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
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

  const filteredServices = services.filter((service: any) => {
    try {
      const { startDate, endDate } = getPeriodDates();
      const serviceDate = new Date(service.createdAt);
      
      const matchesClient = clientId === "todos" || String(service.clientId) === clientId;
      const matchesPeriod = serviceDate >= startDate && serviceDate <= endDate;
      const matchesType = serviceTypeFilter === "todos" || 
        (service.serviceType && service.serviceType === serviceTypeFilter);

      return matchesClient && matchesPeriod && matchesType;
    } catch (error) {
      console.error("❌ [FILTER-ERROR]", error);
      return false;
    }
  });

  const serviceTypes = Array.from(
    new Set(services.map((s: any) => s.serviceType).filter(Boolean))
  );

  const generatePDF = async () => {
    console.log("📄 [GERAR-PDF] Iniciando...");
    try {
      const selectedClient = clientId !== "todos" ? clients.find((c: any) => String(c.id) === clientId) : null;
      const { startDate, endDate } = getPeriodDates();
      
      await generateServiceReportPDF({
        clientName: selectedClient?.name || "Todos os Clientes",
        services: filteredServices,
        startDate,
        endDate,
      });
      console.log("✅ [PDF-SUCESSO]");
    } catch (error) {
      console.error("❌ [PDF-ERRO]", error);
    }
  };

  const totalValue = filteredServices.reduce((sum: number, s: any) => sum + (s.registrationFee || 0), 0);

  return (
    <div className="space-y-6">
      <Link href="/reports">
        <Button variant="outline" className="border-neon text-neon hover:bg-neon/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </Link>

      <Card className="border-neon">
        <CardHeader>
          <CardTitle className="text-neon">Relatório de Serviços por Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Clientes</SelectItem>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="esta-semana">Esta Semana</SelectItem>
                  <SelectItem value="este-mes">Este Mês</SelectItem>
                  <SelectItem value="mes-passado">Mês Passado</SelectItem>
                  <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="este-ano">Este Ano</SelectItem>
                  <SelectItem value="todos-os-periodos">Todos os Períodos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Serviço</label>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  {serviceTypes.map((type: any) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={generatePDF}
                className="w-full bg-neon text-black hover:bg-neon/90"
                disabled={filteredServices.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-neon">
            <span>Serviços ({filteredServices.length})</span>
            <div className="text-sm font-normal text-white">
              Total: <span className="text-neon">{formatCurrency(totalValue)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Nenhum serviço encontrado com os filtros selecionados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neon/30">
                    <TableHead className="text-neon">Serviço</TableHead>
                    <TableHead className="text-neon">Cliente</TableHead>
                    <TableHead className="text-neon">Tipo</TableHead>
                    <TableHead className="text-neon">Data</TableHead>
                    <TableHead className="text-right text-neon">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service: any) => (
                    <TableRow key={service.id} className="border-neon/20">
                      <TableCell className="text-white">{service.name}</TableCell>
                      <TableCell className="text-white">
                        {clients.find((c: any) => c.id === service.clientId)?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-neon text-neon">
                          {service.serviceType || "Sem tipo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{formatDate(service.createdAt)}</TableCell>
                      <TableCell className="text-right text-neon font-semibold">
                        {formatCurrency(service.registrationFee || 0)}
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
