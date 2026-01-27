import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Edit, 
  ArrowRight, 
  FileText, 
  Receipt, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CallWithClient } from "@shared/schema";
import { insertCallSchema } from "@shared/schema";
import { z } from "zod";
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";

const editCallSchema = insertCallSchema.extend({
  clientId: z.coerce.number(),
});

type EditCallData = z.infer<typeof editCallSchema>;

export default function TodayCalls() {
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [editingCall, setEditingCall] = useState<CallWithClient | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionType, setActionType] = useState<"service" | "quote" | "invoice" | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallWithClient | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: calls = [], isLoading } = useQuery<CallWithClient[]>({
    queryKey: ["/api/calls"],
  });

  const form = useForm<EditCallData>({
    resolver: zodResolver(editCallSchema),
    defaultValues: {
      equipment: "",
      serviceType: "",
      priority: "media",
      description: "",
      internalNotes: "",
      status: "aguardando",
      progress: 0,
      clientId: undefined,
    },
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EditCallData> }) => {
      const response = await apiRequest("PATCH", `/api/calls/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowEditDialog(false);
      setEditingCall(null);
      setActionType(null);
      toast({
        title: "Sucesso",
        description: getActionSuccessMessage(),
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao processar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Filtrar chamados de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCalls = calls.filter(call => {
    const callDate = new Date(call.createdAt);
    callDate.setHours(0, 0, 0, 0);
    return callDate.getTime() === today.getTime();
  });

  const filteredCalls = todayCalls.filter(call => {
    const matchesStatus = !statusFilter || statusFilter === "todos" || call.status === statusFilter;
    const matchesClient = !clientFilter || 
      call.client?.name.toLowerCase().includes(clientFilter.toLowerCase());
    
    return matchesStatus && matchesClient;
  });

  const getActionSuccessMessage = () => {
    switch (actionType) {
      case "service":
        return "Chamado transformado em serviço!";
      case "quote":
        return "Chamado enviado para orçamento!";
      case "invoice":
        return "Chamado direcionado para faturamento!";
      default:
        return "Chamado atualizado com sucesso!";
    }
  };

  const handleAction = (call: CallWithClient, action: "edit" | "service" | "quote" | "invoice") => {
    setEditingCall(call);
    setActionType(action === "edit" ? null : action);
    
    form.reset({
      clientId: call.clientId,
      equipment: call.equipment,
      serviceType: call.serviceType,
      priority: call.priority,
      description: call.description,
      internalNotes: call.internalNotes || "",
      status: call.status,
      progress: call.progress || 0,
    });
    
    setShowEditDialog(true);
  };

  const onSubmit = (data: EditCallData) => {
    if (editingCall) {
      let updatedData = { ...data };
      
      // Definir status baseado no tipo de ação
      switch (actionType) {
        case "service":
          updatedData.status = "em_andamento";
          break;
        case "quote":
          updatedData.status = "aguardando_orcamento";
          break;
        case "invoice":
          updatedData.status = "faturar";
          break;
      }
      
      updateCallMutation.mutate({ id: editingCall.id, data: updatedData });
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case "service":
        return "Transformar em Serviço";
      case "quote":
        return "Enviar para Orçamento";
      case "invoice":
        return "Enviar para Faturamento";
      default:
        return "Editar Chamado";
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case "service":
        return "Configure os detalhes do serviço antes de iniciar o atendimento.";
      case "quote":
        return "Prepare as informações para geração do orçamento.";
      case "invoice":
        return "Configure os dados para emissão da nota fiscal.";
      default:
        return "Faça alterações nos dados do chamado.";
    }
  };

  return (
    <div 
      className="p-4 lg:p-8"
      onClick={(e) => {
        // Se clicar no container vazio, deselecionar
        if (e.target === e.currentTarget) {
          setStatusFilter("");
          setClientFilter("");
        }
      }}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chamados de Hoje</h2>
        <p className="text-gray-600">Gerencie os chamados recebidos hoje e direcione para o próximo passo</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold">{todayCalls.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {todayCalls.filter(c => c.status === "aguardando").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {todayCalls.filter(c => c.status === "em_andamento").length}
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {todayCalls.filter(c => c.status === "concluido").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aguardando_orcamento">Aguardando Orçamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("");
                setClientFilter("");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Chamados */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Carregando chamados...</p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum chamado encontrado para hoje.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="space-y-3 p-4">
              {filteredCalls.map((call) => (
                <Card key={call.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              Chamado #{call.id.toString().padStart(3, "0")}
                            </h3>
                            <Badge variant="outline" className={getStatusColor(call.status)}>
                              {getStatusLabel(call.status)}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(call.priority)}>
                              {getPriorityLabel(call.priority)}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">👤 {call.client?.name}</div>
                            <div className="flex items-center gap-1">💻 {call.equipment} - {call.serviceType}</div>
                            <div className="truncate">{call.description}</div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-xs text-gray-500">
                            <div>📅 {formatDate(call.createdAt)}</div>
                            <div>📧 {call.client?.email || "Sem email"}</div>
                            <div>📞 {call.client?.phone || "Sem telefone"}</div>
                            <div>🆔 #{call.id}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCall(call);
                            setShowViewDialog(true);
                          }}
                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(call, "edit")}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleAction(call, "service")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Serviço
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleAction(call, "quote")}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Orçamento
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleAction(call, "invoice")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Faturar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Ação */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle>{getActionTitle()} #{editingCall?.id}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="equipment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipamento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formatacao">Formatação</SelectItem>
                            <SelectItem value="limpeza">Limpeza</SelectItem>
                            <SelectItem value="reparo">Reparo</SelectItem>
                            <SelectItem value="manutencao">Manutenção</SelectItem>
                            <SelectItem value="instalacao">Instalação</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {actionType && (
                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progresso (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field}
                            value={field.value || 0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateCallMutation.isPending}
                >
                  {updateCallMutation.isPending ? "Processando..." : "Confirmar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Call Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
            <DialogHeader>
              <DialogTitle>Detalhes do Chamado #{selectedCall.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Cliente</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Nome:</strong> {selectedCall.client?.name || "Cliente não encontrado"}
                  </p>
                  {selectedCall.client?.email && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Email:</strong> {selectedCall.client.email}
                    </p>
                  )}
                  {selectedCall.client?.phone && (
                    <p className="text-sm text-gray-600">
                      <strong>Telefone:</strong> {selectedCall.client.phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Detalhes do Chamado</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Equipamento:</strong> {selectedCall.equipment}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Tipo:</strong> {selectedCall.serviceType}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Prioridade:</strong> {getPriorityLabel(selectedCall.priority)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {getStatusLabel(selectedCall.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Datas</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Criado:</strong> {formatDate(selectedCall.createdAt)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Atualizado:</strong> {formatDate(selectedCall.updatedAt)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Progresso</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Andamento:</strong> {selectedCall.progress}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição do Problema</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedCall.description}
                </div>
              </div>

              {selectedCall.internalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações Internas</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedCall.internalNotes}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Visualização */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Detalhes do Chamado #{selectedCall?.id}</DialogTitle>
            <DialogDescription>
              Informações completas do chamado técnico
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cliente</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nome:</span>
                    <span className="text-sm font-medium">{selectedCall.client?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedCall.client?.email || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telefone:</span>
                    <span className="text-sm font-medium">{selectedCall.client?.phone || "Não informado"}</span>
                  </div>
                </div>
              </div>

              {/* Informações do Chamado */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Chamado</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Equipamento:</span>
                    <span className="text-sm font-medium">{selectedCall.equipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo de Serviço:</span>
                    <span className="text-sm font-medium">{selectedCall.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="outline" className={getStatusColor(selectedCall.status)}>
                      {getStatusLabel(selectedCall.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prioridade:</span>
                    <Badge variant="outline" className={getPriorityColor(selectedCall.priority)}>
                      {getPriorityLabel(selectedCall.priority)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data de Criação:</span>
                    <span className="text-sm font-medium">{formatDate(selectedCall.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Descrição do Problema */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição do Problema</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedCall.description}
                </div>
              </div>

              {/* Observações Internas */}
              {selectedCall.internalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações Internas</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedCall.internalNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}