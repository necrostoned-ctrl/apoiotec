import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Search, Wrench, Calendar, User, DollarSign, ArrowRight, Plus, Edit, Trash2, Grid3X3, List } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";
import { insertServiceSchema } from "@shared/schema";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  basePrice: z.string().optional(),
  estimatedTime: z.string().optional(),
  category: z.string().optional(),
});

export default function Services() {
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: "",
      estimatedTime: "",
      category: "",
    },
  });

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const filteredServices = services.filter(service => {
    const matchesStatus = !statusFilter || statusFilter === "todos";
    const matchesClient = !clientFilter || 
      service.name.toLowerCase().includes(clientFilter.toLowerCase());
    const matchesPriority = !priorityFilter || priorityFilter === "todos";
    
    return matchesStatus && matchesClient && matchesPriority;
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceFormSchema>) => {
      const response = await apiRequest("POST", "/api/services", data);
      if (!response.ok) {
        throw new Error("Failed to create service");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowServiceDialog(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof serviceFormSchema> }) => {
      const response = await apiRequest("PATCH", `/api/services/${id}`, data);
      if (!response.ok) {
        throw new Error("Failed to update service");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowServiceDialog(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/services/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete service");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const transformServiceToInvoiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      // Criar a transação financeira
      const transactionData = {
        description: `Faturamento - ${service.name}`,
        clientId: 1, // usando valor padrão
        callId: null,
        type: "entrada",
        amount: service.basePrice || "100.00",
        status: "pendente",
      };
      
      const response = await apiRequest("POST", "/api/financial-transactions", transactionData);
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }
      
      // Deletar o serviço após criar a transação
      const deleteResponse = await apiRequest("DELETE", `/api/services/${service.id}`);
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete service");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      toast({
        title: "Sucesso",
        description: "Serviço enviado para faturamento e removido da lista!",
      });
    },
    onError: (error) => {
      console.error("Transform service error:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar para faturamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleView = (id: number) => {
    console.log("View service:", id);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description || "",
      basePrice: service.basePrice || "",
      estimatedTime: service.estimatedTime || "",
      category: service.category || "",
    });
    setShowServiceDialog(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    form.reset();
    setShowServiceDialog(true);
  };

  const handleDelete = (service: Service) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const handleSendToInvoice = (service: Service) => {
    transformServiceToInvoiceMutation.mutate(service);
  };

  const onSubmit = (data: z.infer<typeof serviceFormSchema>) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">Serviços em Andamento</h2>
          <p className="text-cyan-100">Acompanhe o progresso dos serviços que estão sendo executados</p>
        </div>
        <Button onClick={handleAdd} className="bg-primary hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_produtos">Aguardando Produtos</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serviço</label>
              <Input
                placeholder="Nome do serviço..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("");
                setClientFilter("");
                setPriorityFilter("");
              }}
            >
              Limpar Filtros
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="h-12 w-12 bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 w-24 bg-slate-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-4">
                Nenhum serviço encontrado
              </p>
              <p className="text-muted-foreground">
                {services.length === 0 
                  ? "Não há serviços cadastrados no momento."
                  : "Tente ajustar os filtros para encontrar o que procura."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Base</TableHead>
                  <TableHead>Tempo Estimado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description || "Sem descrição"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.category || "Geral"}</Badge>
                    </TableCell>
                    <TableCell>
                      {service.basePrice ? formatCurrency(service.basePrice) : "A consultar"}
                    </TableCell>
                    <TableCell>{service.estimatedTime || "A definir"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendToInvoice(service)}
                          className="text-primary"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      {service.name}
                    </h3>
                    <p className="text-cyan-100">{service.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Serviço Ativo
                    </Badge>
                    <Badge variant="secondary">
                      {service.category || "Geral"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-cyan-100 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Preço: {service.basePrice ? formatCurrency(service.basePrice) : "A consultar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cyan-100 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Tempo estimado: {service.estimatedTime || "A definir"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendToInvoice(service)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={transformServiceToInvoiceMutation.isPending}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {transformServiceToInvoiceMutation.isPending ? "Processando..." : "→ Faturamento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição de Serviço */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Reparo de notebook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição detalhada do serviço..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Base (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2 horas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hardware">Hardware</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="instalacao">Instalação</SelectItem>
                          <SelectItem value="consultoria">Consultoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowServiceDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                >
                  {createServiceMutation.isPending || updateServiceMutation.isPending 
                    ? "Salvando..." 
                    : editingService ? "Atualizar" : "Criar"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}