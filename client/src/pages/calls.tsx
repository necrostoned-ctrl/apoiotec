import { useState, useEffect } from "react";
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
import { useCardLayout } from "@/hooks/use-card-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientSearch } from "@/components/ClientSearch";
import { CallDetailsModal } from "@/components/call-details-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Search, Edit, Eye, ArrowRight, Clock, AlertCircle, Trash2, Wrench, FileText, DollarSign, Plus, User, Calendar as CalendarIcon, Phone, Mail, Loader2 } from "lucide-react";
import { ClientFilter } from "@/components/ClientFilter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CallWithClient, Call } from "@shared/schema";
import { insertCallSchema } from "@shared/schema";
import { z } from "zod";
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocation } from "wouter";

const editCallSchema = insertCallSchema.extend({
  clientId: z.coerce.number(),
  callDate: z.date().optional(),
  createdByUserId: z.coerce.number().optional(),
});

type EditCallData = z.infer<typeof editCallSchema>;

function HistoryTimeline({ callId }: { callId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/call/${callId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    call_created: 'Chamado Criado',
    converted_to_service: 'Convertido em Serviço',
    service_updated: 'Serviço Atualizado',
    converted_to_financial: 'Convertido para Faturamento',
    invoiced: 'Faturado',
    payment_received: 'Pagamento Recebido',
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico ({events.length})
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 history-timeline-list">
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="flex items-start gap-3 text-sm history-event">
            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-medium">
                {eventLabels[event.eventType] || event.eventType}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{event.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {formatDate(event.createdAt)} • {event.userName || 'Sistema'}
              </p>
            </div>
          </div>
        ))}
        {events.length > 10 && (
          <div className="text-xs text-gray-500 text-center py-2">
            +{events.length - 10} eventos adicionais
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calls({ currentUser }: { currentUser?: any }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingCall, setEditingCall] = useState<CallWithClient | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionType, setActionType] = useState<"edit" | "service" | "invoice" | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [callForInvoice, setCallForInvoice] = useState<CallWithClient | null>(null);
  const [, setLocation] = useLocation();
  const [quickFilterPriority, setQuickFilterPriority] = useState<string | null>(null);
  const [sortByDate, setSortByDate] = useState(false);
  const { layout, updateLayout, getGridClass } = useCardLayout();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLayoutChange = () => forceUpdate({});
    window.addEventListener("layoutChange", handleLayoutChange);
    return () => window.removeEventListener("layoutChange", handleLayoutChange);
  }, []);
  
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: calls = [], isLoading } = useQuery<CallWithClient[]>({
    queryKey: ["/api/calls"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const getClientNameFromCall = (call: any) => {
    const name = call?.client?.name || clients?.find((c: any) => c.id === call?.clientId)?.name;
    return name || "N/A";
  };

  const getClientIdFromCall = (call: any) => {
    return call?.client?.id ?? call?.clientId ?? null;
  };

  const clientFormSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
  });

  type ClientFormData = z.infer<typeof clientFormSchema>;

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", {
        ...data,
        status: "ativo",
        userId: loggedUser?.id || 1
      });
      return response.json();
    },
    onSuccess: (newClient: any) => {
      // Atualizar lista de clientes
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      
      // Fechar dialog e preencher campo do cliente
      setShowNewClientDialog(false);
      clientForm.reset();
      
      // Usar setTimeout mínimo para garantir sincronização
      setTimeout(() => {
        form.setValue("clientId", newClient.id);
      }, 50);
      
      toast({
        title: "✅ Cliente Criado!",
        description: `"${newClient.name}" foi adicionado e selecionado no formulário.`,
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "❌ Erro ao Criar Cliente",
        description: "Verifique as informações e tente novamente.",
        variant: "destructive",
      });
    },
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
    },
  });

  const updateCallMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EditCallData> }) => {
      const updateData = {
        ...data,
        currentUserId: loggedUser?.id || 1,
        userId: editingCall?.userId || loggedUser?.id || 1,
        createdByUserId: data.createdByUserId || editingCall?.createdByUserId || editingCall?.userId || loggedUser?.id || 1
      };
      const response = await apiRequest("PATCH", `/api/calls/${id}`, updateData);
      return response.json();
    },
    onSuccess: (updatedCall) => {
      queryClient.setQueryData(["/api/calls"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((c: any) => c.id === updatedCall.id ? { ...c, ...updatedCall } : c);
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.refetchQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setShowEditDialog(false);
      setEditingCall(null);
      toast({
        title: "Sucesso",
        description: "Chamado atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const transformToServiceMutation = useMutation({
    mutationFn: async (call: CallWithClient) => {
      const resolvedClientId = call.clientId ?? call.client?.id;
      if (!resolvedClientId) {
        throw new Error("Chamado não possui cliente associado");
      }

      // Format description to separate Service from Internal Notes cleanly
      const formattedDescription = call.internalNotes 
        ? `${call.description || 'Não informado'}\n\n=== OBSERVAÇÕES INTERNAS ===\n${call.internalNotes}`
        : (call.description || 'Não informado');

      const serviceData = {
        name: call.equipment ? `Serviço: ${call.equipment}` : "Serviço Técnico",
        description: formattedDescription,
        basePrice: "100.00",
        estimatedTime: "2 horas",
        category: "Reparo",
        clientId: resolvedClientId,
        callId: call.id,
        currentUserId: loggedUser?.id || 1,
        userId: (call as any).createdByUserId || call.userId || loggedUser?.id || 1,
        createdByUserId: (call as any).createdByUserId || call.userId || loggedUser?.id || 1,
        callDate: call.callDate,
        serviceDate: new Date(),
        createdAt: call.createdAt ? new Date(call.createdAt) : new Date(),
      };

      const serviceResponse = await apiRequest("POST", "/api/services", serviceData);
      const newService = await serviceResponse.json();
      
      await apiRequest("PATCH", `/api/calls/${call.id}`, { 
        status: "em_andamento",
        skipNotification: true,
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1
      });

      return newService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Chamado transformado em serviço com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao transformar chamado:", error);
      toast({
        title: "Erro",
        description: "Erro ao transformar chamado em serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const openCalls = calls.filter(call => 
    call.status === "aguardando" || call.status === "aguardando_orcamento"
  );

  const filteredCalls = openCalls.filter(call => {
    const callClientId = getClientIdFromCall(call);
    const matchesStatus = !statusFilter || statusFilter === "todos" || call.status === statusFilter;
    const matchesClient = !clientFilter || clientFilter === "todos" ||
      (callClientId?.toString() === clientFilter);
    // Se quickFilterPriority está ativo, usar ele; senão usar priorityFilter
    const effectivePriorityFilter = quickFilterPriority || priorityFilter;
    const matchesPriority = !effectivePriorityFilter || effectivePriorityFilter === "todos" || call.priority === effectivePriorityFilter;
    const matchesUser = !userFilter || userFilter === "todos" || call.userId?.toString() === userFilter;
    const matchesSearch = !searchTerm || 
      call.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientNameFromCall(call).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesClient && matchesPriority && matchesSearch && matchesUser;
  }).sort((a, b) => {
    // Se sortByDate está ativo, ordenar cronologicamente (criados primeiro)
    if (sortByDate) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    // Senão, ordenar por prioridade (urgente primeiro)
    const priorityOrder: Record<string, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };
    return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
  });

  const handleEdit = (call: CallWithClient, action: "edit" | "service" | "invoice" = "edit") => {
    setEditingCall(call);
    setActionType(action);
    form.reset({
      clientId: call.clientId || undefined,
      equipment: call.equipment,
      serviceType: call.serviceType,
      priority: call.priority,
      description: call.description,
      internalNotes: call.internalNotes || "",
      status: call.status,
      progress: call.progress || 0,
      callDate: call.callDate ? new Date(call.callDate) : undefined,
      createdByUserId: (call as any).createdByUserId || call.userId,
    });
    setShowEditDialog(true);
  };

  const handleTransformToService = (call: CallWithClient) => {
    setCallForServiceConfirm(call);
    setShowServiceConfirmDialog(true);
  };

  const handleSendToInvoice = (call: CallWithClient) => {
    setCallForInvoice(call);
    setInvoiceAmount("");
    setShowInvoiceDialog(true);
  };

  const confirmInvoice = () => {
    if (!callForInvoice || !invoiceAmount) return;
    
    const transactionData = {
      description: `Faturamento - ${callForInvoice.equipment}`,
      clientId: callForInvoice.clientId,
      callId: callForInvoice.id,
      type: "entrada",
      amount: invoiceAmount,
      status: "pendente",
      userId: (callForInvoice as any).createdByUserId || callForInvoice.userId || loggedUser?.id || 1,
      createdByUserId: (callForInvoice as any).createdByUserId || callForInvoice.userId || loggedUser?.id || 1,
    };
    
    createTransactionMutation.mutate(transactionData);
    
    setShowInvoiceDialog(false);
    setCallForInvoice(null);
    setInvoiceAmount("");
  };

  const transformToQuoteMutation = useMutation({
    mutationFn: async (call: CallWithClient) => {
      const resolvedClientId = call.clientId ?? call.client?.id;
      const quoteData = {
        title: `Orçamento - ${call.equipment}`,
        description: call.description,
        clientId: resolvedClientId,
        callId: call.id,
        items: JSON.stringify([{ 
          description: call.serviceType || "Serviço técnico", 
          amount: "100.00" 
        }]),
        subtotal: "100.00",
        total: "100.00",
        status: "pendente",
      };
      
      const response = await apiRequest("POST", "/api/quotes", quoteData);
      if (!response.ok) {
        throw new Error("Failed to create quote");
      }
      
      await apiRequest("PATCH", `/api/calls/${call.id}`, { 
        status: "orcamento_criado",
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Orçamento criado com base no chamado!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleTransformToQuote = (call: CallWithClient) => {
    transformToQuoteMutation.mutate(call);
  };

  const deleteCallMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/calls/${id}`, {
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Failed to delete call");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Chamado excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCall = (call: CallWithClient) => {
    if (confirm("Tem certeza que deseja excluir este chamado?")) {
      deleteCallMutation.mutate(call.id);
    }
  };

  const [selectedCall, setSelectedCall] = useState<CallWithClient | null>(null);
  const [callForServiceConfirm, setCallForServiceConfirm] = useState<CallWithClient | null>(null);
  const [showServiceConfirmDialog, setShowServiceConfirmDialog] = useState(false);

  const handleView = (call: CallWithClient) => {
    setSelectedCall(call);
  };

  const handleConfirmService = () => {
    if (callForServiceConfirm) {
      transformToServiceMutation.mutate(callForServiceConfirm);
      setShowServiceConfirmDialog(false);
      setCallForServiceConfirm(null);
    }
  };

  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response.json();
    },
    onSuccess: async () => {
      if (editingCall) {
        await apiRequest("PATCH", `/api/calls/${editingCall.id}`, { 
          status: "orcamento",
          currentUserId: loggedUser?.id || 1,
          userId: loggedUser?.id || 1
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowEditDialog(false);
      setEditingCall(null);
      toast({
        title: "Sucesso",
        description: "Chamado transformado em orçamento com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao transformar em orçamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditCallData) => {
    if (editingCall) {
      const processedData = {
        ...data,
        callDate: data.callDate || undefined,
        userId: loggedUser?.id || 1,
        createdByUserId: data.createdByUserId || loggedUser?.id || 1,
      };
      
      if (actionType === "service") {
        const updatedCall = { ...editingCall, ...processedData, status: "em_andamento", callDate: processedData.callDate || null };
        transformToServiceMutation.mutate(updatedCall as CallWithClient);
      } else if (actionType === "invoice") {
        const transactionData = {
          description: processedData.serviceType || `Faturamento - ${editingCall.equipment}`,
          clientId: editingCall.clientId,
          callId: editingCall.id,
          type: "entrada",
          amount: (processedData.progress || 100).toString(),
          status: "pendente",
          billingDate: new Date(),
          userId: loggedUser?.id || 1,
          createdByUserId: data.createdByUserId || loggedUser?.id || 1,
        };

        createTransactionMutation.mutate(transactionData);
      } else {
        updateCallMutation.mutate({ id: editingCall.id, data: processedData });
      }
    }
  };

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/financial-transactions", data);
      
      if (data.callId) {
        await apiRequest("PATCH", `/api/calls/${data.callId}`, { 
          status: "faturado",
          currentUserId: loggedUser?.id || 1,
          userId: loggedUser?.id || 1
        });
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowEditDialog(false);
      setEditingCall(null);
      toast({
        title: "Sucesso",
        description: "Chamado enviado para faturamento com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar para faturamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: filteredCalls.length,
    urgentes: filteredCalls.filter(c => c.priority === "urgente").length,
    altas: filteredCalls.filter(c => c.priority === "alta").length,
    media: filteredCalls.filter(c => c.priority === "media").length,
    baixas: filteredCalls.filter(c => c.priority === "baixa").length,
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Chamados em Aberto</h1>
          <p className="text-gray-400">Gerencie todos os seus chamados técnicos</p>
        </div>
        <Button onClick={() => setLocation("/new-call")} className="bg-cyan-600 hover:bg-cyan-700 border-4 border-cyan-500 dark:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 dark:shadow-cyan-500/20 shadow-lg w-full sm:w-auto text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      <div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <button onClick={() => {
            setSortByDate(!sortByDate);
            setQuickFilterPriority(null);
          }} className="transition-all hover:-translate-y-1">
            <Card className={`bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all cursor-pointer h-28 ${sortByDate ? 'ring-4 ring-blue-400 scale-105' : ''}`}>
              <CardContent className="h-full flex flex-col items-center justify-center p-4">
                <p className="text-sm font-semibold text-primary dark:text-blue-400 mb-2">Total</p>
                <div className="text-3xl font-bold text-primary dark:text-blue-400">{stats.total}</div>
                {sortByDate && <p className="text-xs text-primary dark:text-blue-400 font-semibold mt-2">📅 Cronológico</p>}
              </CardContent>
            </Card>
          </button>

          <button onClick={() => {
            setQuickFilterPriority(quickFilterPriority === "urgente" ? null : "urgente");
            setSortByDate(false);
          }} className="transition-all hover:-translate-y-1">
            <Card className={`bg-background dark:bg-slate-800 border-4 border-red-600 dark:border-red-500 hover:shadow-lg hover:shadow-red-600/50 shadow-lg dark:shadow-red-600/20 transition-all cursor-pointer h-28 ${quickFilterPriority === "urgente" ? 'ring-4 ring-red-400 scale-105' : ''}`}>
              <CardContent className="h-full flex flex-col items-center justify-center p-4">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Urgente</p>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.urgentes}</div>
                {quickFilterPriority === "urgente" && <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">🔴 Filtrado</p>}
              </CardContent>
            </Card>
          </button>

          <button onClick={() => {
            setQuickFilterPriority(quickFilterPriority === "alta" ? null : "alta");
            setSortByDate(false);
          }} className="transition-all hover:-translate-y-1">
            <Card className={`bg-background dark:bg-slate-800 border-4 border-orange-600 dark:border-orange-500 hover:shadow-lg hover:shadow-orange-600/50 shadow-lg dark:shadow-orange-600/20 transition-all cursor-pointer h-28 ${quickFilterPriority === "alta" ? 'ring-4 ring-orange-400 scale-105' : ''}`}>
              <CardContent className="h-full flex flex-col items-center justify-center p-4">
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">Alta</p>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.altas}</div>
                {quickFilterPriority === "alta" && <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-2">🟠 Filtrado</p>}
              </CardContent>
            </Card>
          </button>

          <button onClick={() => {
            setQuickFilterPriority(quickFilterPriority === "media" ? null : "media");
            setSortByDate(false);
          }} className="transition-all hover:-translate-y-1">
            <Card className={`bg-background dark:bg-slate-800 border-4 border-yellow-500 dark:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 shadow-lg dark:shadow-yellow-500/20 transition-all cursor-pointer h-28 ${quickFilterPriority === "media" ? 'ring-4 ring-yellow-300 scale-105' : ''}`}>
              <CardContent className="h-full flex flex-col items-center justify-center p-4">
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Média</p>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.media}</div>
                {quickFilterPriority === "media" && <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mt-2">🟡 Filtrado</p>}
              </CardContent>
            </Card>
          </button>

          <button onClick={() => {
            setQuickFilterPriority(quickFilterPriority === "baixa" ? null : "baixa");
            setSortByDate(false);
          }} className="transition-all hover:-translate-y-1">
            <Card className={`bg-background dark:bg-slate-800 border-4 border-green-600 dark:border-green-500 hover:shadow-lg hover:shadow-green-600/50 shadow-lg dark:shadow-green-600/20 transition-all cursor-pointer h-28 ${quickFilterPriority === "baixa" ? 'ring-4 ring-green-400 scale-105' : ''}`}>
              <CardContent className="h-full flex flex-col items-center justify-center p-4">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Baixa</p>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.baixas}</div>
                {quickFilterPriority === "baixa" && <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2">🟢 Filtrado</p>}
              </CardContent>
            </Card>
          </button>
        </div>
      </div>

      <Card className="mb-6 bg-background dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-primary dark:text-blue-400" />
            Filtros
            <span className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
          </CardTitle>
        </CardHeader>
        {showFilters && (
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="🔍 Buscar por equipamento, descrição, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2.5 bg-background dark:bg-slate-800 border-4 border-gray-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Cliente</label>
                <ClientFilter
                  value={clientFilter}
                  onChange={setClientFilter}
                  placeholder="Selecionar..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="aguardando_orcamento">Aguardando Orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Prioridade</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Prioridades</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Criado Por</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Usuários</SelectItem>
                    {users?.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || clientFilter || statusFilter || priorityFilter || userFilter !== "todos") && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setClientFilter("");
                    setStatusFilter("");
                    setPriorityFilter("");
                    setUserFilter("todos");
                  }}
                  className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-medium"
                >
                  ✕ Limpar todos os filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        )}
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando chamados...</p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <Card className="bg-background dark:bg-slate-800 border-4 border-purple-500 dark:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 shadow-lg dark:shadow-purple-500/20 transition-all shadow-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 font-semibold">Nenhum chamado encontrado</p>
            <p className="text-gray-500 dark:text-gray-400">
              {calls.length === 0 
                ? "Os novos chamados aparecerão aqui."
                : "Tente ajustar os filtros para encontrar o que procura."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {filteredCalls.map((call) => (
            <Card key={call.id} className={`bg-background dark:bg-slate-800 border-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group flex flex-col h-full shadow-lg ${
              call.priority === "urgente" ? "border-red-500 dark:border-red-400 hover:shadow-red-500/50 dark:shadow-red-500/20" :
              call.priority === "alta" ? "border-orange-500 dark:border-orange-400 hover:shadow-orange-500/50 dark:shadow-orange-500/20" :
              call.priority === "media" ? "border-yellow-500 dark:border-yellow-400 hover:shadow-yellow-500/50 dark:shadow-yellow-500/20" :
              "border-green-500 dark:border-green-400 hover:shadow-green-500/50 dark:shadow-green-500/20"
            }`}>
              <CardContent className="p-0 flex flex-col flex-1 relative">
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="outline" className={`${getPriorityColor(call.priority)} text-xs h-5 px-2 border font-semibold`}>
                    {getPriorityLabel(call.priority)}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1 mt-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">Cliente</p>
                    <div className="text-right flex-shrink-0 max-w-xs">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Criado Por</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-xs text-right break-words">{users?.find(u => u.id === ((call as any).createdByUserId ?? call.userId))?.name || "Sistema"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm break-words flex-1">
                      {getClientNameFromCall(call)}
                    </p>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                      {call.callDate ? format(new Date(call.callDate), "dd/MM/yyyy") : formatDate(call.createdAt).split(" ")[0]}
                    </span>
                  </div>

                  {/* Mostrando Serviço (Descrição original do chamado) e Equipamento */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Equipamento</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {call.equipment || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Serviço</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {call.description || "Nenhum serviço descrito"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(call)}
                        className="h-8 text-xs text-cyan-400 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex flex-col items-center justify-center p-1"
                        title="Ver Detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(call, "edit")}
                        className="h-8 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex flex-col items-center justify-center p-1"
                        title="Editar Chamado"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTransformToService(call)}
                        className="h-8 text-xs text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col items-center justify-center p-1"
                        title="Converter para Serviço"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendToInvoice(call)}
                        className="h-8 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex flex-col items-center justify-center p-1"
                        title="Faturar Diretamente"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCall(call)}
                        className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col items-center justify-center p-1"
                        title="Deletar Chamado"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {callForServiceConfirm && (
        <Dialog open={showServiceConfirmDialog} onOpenChange={setShowServiceConfirmDialog}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Enviar para Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Tem certeza que deseja converter o chamado <strong>#{callForServiceConfirm.id}</strong> para um <strong>Serviço</strong>?
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Cliente:</strong> {getClientNameFromCall(callForServiceConfirm)}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Equipamento:</strong> {callForServiceConfirm.equipment || "Não informado"}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Serviço:</strong> {callForServiceConfirm.description?.substring(0, 80)}...
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowServiceConfirmDialog(false);
                    setCallForServiceConfirm(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmService}
                  className="bg-primary hover:bg-blue-700 text-white"
                  disabled={transformToServiceMutation.isPending}
                >
                  {transformToServiceMutation.isPending ? "Enviando..." : "Sim, Enviar para Serviço"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <CallDetailsModal 
        isOpen={!!selectedCall} 
        onClose={() => setSelectedCall(null)} 
        call={selectedCall} 
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle>
              {actionType === "service" && "Transformar em Serviço"}
              {actionType === "invoice" && "Enviar para Faturamento"}
              {actionType === "edit" && `Editar Chamado #${editingCall?.id}`}
            </DialogTitle>
            <DialogDescription>
              {actionType === "service" && "Configure os detalhes antes de iniciar o serviço."}
              {actionType === "invoice" && "Prepare os dados para faturamento."}
              {actionType === "edit" && "Faça alterações nos dados do chamado."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="callDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Chamado</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Data atual</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          disabled={false}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Cliente</FormLabel>
                    </div>
                    <FormControl>
                      <ClientSearch
                        value={field.value}
                        onSelect={(clientId) => {
                          field.onChange(clientId || null);
                        }}
                        placeholder="Digite nome ou telefone do cliente..."
                        allowEmpty={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Servidor Dell, Notebook HP, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aguardando">Aguardando</SelectItem>
                            <SelectItem value="aguardando_orcamento">Aguardando Orçamento</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço / Problema Relatado</FormLabel>
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-blue-700"
                >
                  Salvar Alterações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
