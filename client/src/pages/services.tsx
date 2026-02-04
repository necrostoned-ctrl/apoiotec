import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCardLayout } from "@/hooks/use-card-layout";
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
import { Search, Wrench, Calendar, User, DollarSign, ArrowRight, Plus, Edit, Trash2, Eye, Package, FileText, Clock } from "lucide-react";
import { ServiceDetailsModal } from "@/components/service-details-modal";
import { InventoryItemSearch } from "@/components/InventoryItemSearch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { memo } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service, Client } from "@shared/schema";
import { insertServiceSchema } from "@shared/schema";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import { format } from "date-fns";
import { ClientSearch } from "@/components/ClientSearch";
import { ClientFilter } from "@/components/ClientFilter";
import { generateQuotePDF } from "@/utils/professionalPdfGenerator";
import { PDFViewer } from "@/components/PDFViewer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SignatureModal } from "@/components/SignatureModal";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  basePrice: z.string().optional(), // Mantido para compatibilidade, não será mostrado no formulário
  priority: z.string().optional(),
  clientId: z.coerce.number().optional().nullable(),
  serviceDate: z.string().optional(),
  createdByUserId: z.coerce.number().optional(),
});

// History Timeline Component - Memoized for performance
const HistoryTimeline = memo(function HistoryTimeline({ serviceId }: { serviceId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/service/${serviceId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    call_created: 'Chamado Criado',
    converted_to_service: 'Convertido de Chamado',
    service_created: 'Serviço Criado',
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
});

export default function Services({ currentUser }: { currentUser?: any }) {
  // Obter usuário atual logado (fallback para localStorage se não recebido via prop)
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  
  // 🔥 DEBUG: Log do usuário logado
  console.log("🔍 [SERVICES] Usuário logado:", {
    propRecebida: currentUser,
    loggedUserFinal: loggedUser,
    userId: loggedUser?.id,
    userName: loggedUser?.name || loggedUser?.username
  });
  
  // GARANTIR que loggedUser tem um ID válido para notificações
  const validatedLoggedUserId = loggedUser?.id && loggedUser.id > 0 ? loggedUser.id : 1;
  
  console.log("✅ [SERVICES] ValidatedUserId:", validatedLoggedUserId, "from ID:", loggedUser?.id);
  const { layout, updateLayout, getGridClass } = useCardLayout();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLayoutChange = () => forceUpdate({});
    window.addEventListener("layoutChange", handleLayoutChange);
    return () => window.removeEventListener("layoutChange", handleLayoutChange);
  }, []);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [userFilter, setUserFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("todos");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceValue, setInvoiceValue] = useState("");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);
  const [askSignatureModalOpen, setAskSignatureModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [shouldSignDocument, setShouldSignDocument] = useState(false);
  const [pdfBlobForSign, setPdfBlobForSign] = useState<Blob | null>(null);
  const [serviceForSign, setServiceForSign] = useState<Service | null>(null);
  
  // Estados para edição de produtos/serviços em serviços existentes
  const [editingProducts, setEditingProducts] = useState<any[]>([]);
  const [showEditProductsDialog, setShowEditProductsDialog] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number>(-1);
  const [isManualMode, setIsManualMode] = useState(false);
  const [newProductItem, setNewProductItem] = useState({
    name: "",
    type: "produto" as "produto" | "servico",
    unitPrice: "",
    quantity: "1",
    totalPrice: "0.00",
    inventoryId: null as number | null,
    inventoryType: null as "product" | "service" | null
  });
  

  // Função para calcular o preço total automaticamente
  const calculateTotalPrice = (unitPrice: string, quantity: string) => {
    const unit = parseFloat(unitPrice) || 0;
    const qty = parseInt(quantity) || 1;
    return (unit * qty).toFixed(2);
  };
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "media",
      clientId: undefined,
      serviceDate: "",
      createdByUserId: validatedLoggedUserId,
    },
  });

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Queries para inventory
  const { data: inventoryProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/products"],
  });

  const { data: inventoryServices = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory/services"],
  });


  // Filtrar serviços baseado na busca e filtros
  const filteredServices = services.filter(service => {
    // Quando não há searchTerm, matchesSearch deve ser true
    const matchesSearch = !searchTerm || service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClient = !clientFilter || clientFilter === "todos" || service.clientId?.toString() === clientFilter;
    
    const matchesStatus = !statusFilter || statusFilter === "todos" || (service.category && service.category.toLowerCase() === statusFilter);
    
    const matchesUser = !userFilter || userFilter === "todos" || service.userId?.toString() === userFilter;

    const matchesPriority = !priorityFilter || priorityFilter === "todos" || service.priority === priorityFilter;

    // Filtro de período - quando "todos", aceita tudo
    let matchesPeriod = true;
    if (periodFilter && periodFilter !== "todos") {
      const serviceDate = service.serviceDate ? new Date(service.serviceDate) : new Date(service.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (periodFilter === "hoje") {
        const isToday = serviceDate.toDateString() === today.toDateString();
        matchesPeriod = isToday;
      } else if (periodFilter === "semana") {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesPeriod = serviceDate >= sevenDaysAgo && serviceDate <= today;
      } else if (periodFilter === "mes") {
        matchesPeriod = serviceDate.getMonth() === today.getMonth() && serviceDate.getFullYear() === today.getFullYear();
      } else if (periodFilter === "customizado" && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        matchesPeriod = serviceDate >= startDate && serviceDate <= endDate;
      }
    }
    
    const passes = matchesSearch && matchesClient && matchesStatus && matchesUser && matchesPriority && matchesPeriod;
    
    // Debug log para serviços que não passam no filtro
    if (!passes && clientFilter && service.clientId?.toString() === clientFilter) {
      console.log("❌ Service filtered out:", {
        name: service.name,
        clientFilter,
        serviceClientId: service.clientId?.toString(),
        matchesSearch,
        matchesClient,
        matchesStatus,
        matchesUser,
        matchesPriority,
        matchesPeriod,
        periodFilter,
        searchTerm,
        userFilter,
        statusFilter,
        priorityFilter
      });
    }
    
    return passes;
  });

  // Calcular estatísticas de prioridade
  const totalServices = filteredServices.length;
  const urgenteCount = services.filter(s => s.priority === "urgente").length;
  const altaCount = services.filter(s => s.priority === "alta").length;
  const mediaCount = services.filter(s => s.priority === "media").length;
  const baixaCount = services.filter(s => s.priority === "baixa").length;

  const createServiceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceFormSchema>) => {
      // Adicionar userId do usuário logado
      const serviceData = {
        ...data,
        userId: validatedLoggedUserId,
        createdByUserId: validatedLoggedUserId,
        currentUserId: validatedLoggedUserId
      };
      
      console.log("=== CRIANDO SERVIÇO ===");
      console.log("Dados do serviço:", serviceData);
      console.log("Usuário logado:", loggedUser);
      
      const response = await apiRequest("POST", "/api/services", serviceData);
      const result = await response.json();
      
      console.log("Serviço criado:", result);
      return result;
    },
    onSuccess: (newService) => {
      // Resetar filtros para mostrar todos os serviços
      setSearchTerm("");
      setClientFilter("");
      setStatusFilter("");
      setUserFilter("todos");
      setPriorityFilter("");
      setPeriodFilter("todos"); // Resetar filtro de período para ver o novo serviço
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
      
      // Atualizar cache de forma otimista primeiro
      queryClient.setQueryData(["/api/services"], (old: any) => {
        if (!Array.isArray(old)) return [newService];
        return [...old, newService];
      });
      // Depois invalidar e refetch para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.refetchQueries({ queryKey: ["/api/services"] });
      
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
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof serviceFormSchema> }) => {
      // Preservar os dados de produtos/serviços existentes e cliente
      const updateData = {
        ...data,
        products: editingService?.products, // CRÍTICO: preservar products existentes
        clientId: editingService?.clientId, // CRÍTICO: preservar cliente
        serviceDate: data.serviceDate || editingService?.serviceDate, // PRESERVAR data do serviço
        userId: editingService?.userId || validatedLoggedUserId, // PRESERVAR usuário criador
        createdByUserId: data.createdByUserId || (editingService as any)?.createdByUserId || editingService?.userId || validatedLoggedUserId, // PERMITE MUDANÇA: Usa novo valor do formulário se fornecido
        currentUserId: validatedLoggedUserId // ADICIONAR ID do usuário que está fazendo a atualização PARA NOTIFICAÇÕES
      };
      
      console.log("=== ATUALIZANDO SERVIÇO ===");
      console.log("Dados originais do serviço:", editingService);
      console.log("Novos dados do formulário:", data);
      console.log("Dados finais a enviar:", updateData);
      console.log("Usuário logado que está fazendo a atualização:", loggedUser?.id);
      
      const response = await apiRequest("PATCH", `/api/services/${id}`, updateData);
      return response.json();
    },
    onSuccess: (updatedService) => {
      // CRÍTICO: Atualizar cache + refetch GARANTIDO
      queryClient.setQueryData(["/api/services"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((s: any) => s.id === updatedService.id ? { ...s, ...updatedService } : s);
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.refetchQueries({ queryKey: ["/api/services"] });
      
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

  // Mutation para atualizar produtos de um serviço
  const updateServiceProductsMutation = useMutation({
    mutationFn: async ({ id, products }: { id: number; products: any[] }) => {
      console.log("🔧 [PRODUTOS] Adicionando/Editando produtos do serviço:", {
        serviceId: id,
        validatedLoggedUserId,
        loggedUserId: loggedUser?.id,
        userName: loggedUser?.name || loggedUser?.username,
        selectedServiceUserId: selectedService?.userId,
        productCount: products.length
      });
      
      const updatePayload = {
        products: JSON.stringify(products),
        userId: selectedService?.userId || validatedLoggedUserId, // PRESERVAR usuário criador
        currentUserId: validatedLoggedUserId // CRÍTICO: Usar currentUserId para notificações
      };
      
      console.log("📤 [PRODUTOS] Payload sendo enviado:", updatePayload);
      
      const response = await apiRequest("PATCH", `/api/services/${id}`, updatePayload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowEditProductsDialog(false);
      setSelectedService(null);
      toast({
        title: "Sucesso",
        description: "Produtos atualizados com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produtos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      // Encontrar o serviço para recuperar seus produtos
      const serviceToDelete = services.find(s => s.id === id);
      
      const response = await apiRequest("DELETE", `/api/services/${id}`, {
        currentUserId: validatedLoggedUserId,
        userId: validatedLoggedUserId
      });
      if (!response.ok) {
        throw new Error("Failed to delete service");
      }
      
      // Devolver produtos ao estoque
      if (serviceToDelete?.products) {
        try {
          const products = JSON.parse(serviceToDelete.products);
          // Buscar produtos do inventário para matching por nome
          const inventoryResponse = await fetch("/api/inventory/products");
          const inventoryProducts = inventoryResponse.ok ? await inventoryResponse.json() : [];
          
          for (const product of products) {
            let productIdToReturn = product.inventoryId;
            
            // Se não tem inventoryId, tenta encontrar por nome
            if (!productIdToReturn && (product.type === "produto" || product.inventoryType === "product")) {
              const foundProduct = inventoryProducts.find((p: any) => 
                p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
              );
              productIdToReturn = foundProduct?.id;
            }
            
            // Se encontrou o ID, devolve ao estoque
            if (productIdToReturn && (product.type === "produto" || product.inventoryType === "product")) {
              console.log(`↩️  Devolvendo ${product.quantity} unidades do produto ${productIdToReturn} ao estoque`);
              const clientName = serviceToDelete?.clientId ? clients.find(c => c.id === serviceToDelete.clientId)?.name || "Cliente desconhecido" : "Sem cliente";
              await apiRequest("POST", "/api/inventory/movements", {
                productId: productIdToReturn,
                type: "entrada",
                quantity: parseInt(product.quantity) || 1,
                reference: `service_delete_${id}`,
                notes: `Devolvido ao deletar serviço do cliente: ${clientName}`
              });
              console.log(`✅ Devolução realizada!`);
            }
          }
          queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
          queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
        } catch (err) {
          console.error("Erro ao devolver produtos ao estoque:", err);
        }
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
    mutationFn: async ({ service, amount }: { service: Service; amount: string }) => {
      console.log("=== ENVIANDO SERVIÇO PARA FATURAMENTO (PRESERVANDO DISCRIMINAÇÃO) ===");
      console.log("Serviço:", service);
      console.log("ClientId do serviço:", service.clientId);

      // PRESERVAR NOME ORIGINAL DO SERVIÇO SEPARADO DA DESCRIÇÃO
      const serviceName = service.name || "Serviço Técnico";
      let serviceDescription = service.description || "";
      
      console.log("=== PRESERVANDO NOME ORIGINAL DO SERVIÇO ===");
      console.log("Nome original do serviço:", serviceName);
      console.log("Descrição do serviço:", serviceDescription);
      
      console.log("=== PROCESSANDO PRODUTOS DO SERVIÇO ===");
      console.log("Service.products:", service.products);
      
      if (service.products) {
        try {
          const products = JSON.parse(service.products);
          console.log("Produtos parseados:", products);
          
          if (products.length > 0) {
            // CRIAR DISCRIMINAÇÃO DE VALORES SEPARADA
            serviceDescription += (serviceDescription ? "\n\n" : "") + "Discriminação de valores:";
            
            // Separar serviços e produtos
            const serviceItems = products.filter((item: any) => item.type === 'servico');
            const productItems = products.filter((item: any) => item.type === 'produto' || !item.type);
            
            // Adicionar serviços
            if (serviceItems.length > 0) {
              serviceDescription += "\n\nServiços:";
              serviceItems.forEach((item: any) => {
                const quantity = parseInt(item.quantity?.toString() || '1') || 1;
                const totalAmount = parseFloat(item.amount || item.price || 0);
                let itemDescription = item.description || item.name;
                
                if (quantity > 1 && totalAmount > 0) {
                  const unitPrice = totalAmount / quantity;
                  itemDescription = `${quantity}x ${itemDescription} (R$ ${unitPrice.toFixed(2).replace('.', ',')} cada)`;
                }
                
                serviceDescription += `\n- ${itemDescription}: R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
              });
            }
            
            // Adicionar produtos
            if (productItems.length > 0) {
              serviceDescription += "\n\nProdutos/Materiais:";
              productItems.forEach((item: any) => {
                const quantity = parseInt(item.quantity?.toString() || '1') || 1;
                const totalAmount = parseFloat(item.amount || item.price || 0);
                let itemDescription = item.description || item.name;
                
                if (quantity > 1 && totalAmount > 0) {
                  const unitPrice = totalAmount / quantity;
                  itemDescription = `${quantity}x ${itemDescription} (R$ ${unitPrice.toFixed(2).replace('.', ',')} cada)`;
                }
                
                serviceDescription += `\n- ${itemDescription}: R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
              });
            }
            
            // PRESERVAR DADOS ESTRUTURADOS PARA O SISTEMA
            serviceDescription += "\n\n" + JSON.stringify(products);
            console.log("Descrição com discriminação legível + estruturada:", serviceDescription);
          } else {
            console.log("Array de produtos vazio");
          }
        } catch (error) {
          console.error("Erro ao fazer parse dos produtos:", error);
        }
      } else {
        console.log("Nenhum produto encontrado no serviço");
      }

      // Calcular valores separados de serviços e produtos
      let serviceAmount = 0;
      let productAmount = 0;
      let serviceDetails: any[] = [];
      let productDetails: any[] = [];
      let parsedProducts: any[] = [];

      // Parse dos produtos novamente para o cálculo
      if (service.products) {
        try {
          parsedProducts = JSON.parse(service.products);
        } catch (error) {
          console.error("Erro ao fazer parse dos produtos para cálculo:", error);
          parsedProducts = [];
        }
      }

      if (parsedProducts && parsedProducts.length > 0) {
        parsedProducts.forEach((item: any) => {
          const itemValue = parseFloat(item.amount || item.price || 0);
          const quantity = parseInt(item.quantity?.toString() || '1') || 1;
          
          if (item.type === 'servico') {
            serviceAmount += itemValue;
            serviceDetails.push({
              name: item.description || item.name,
              amount: itemValue,
              quantity: quantity,
              type: 'servico'
            });
          } else {
            productAmount += itemValue;
            productDetails.push({
              name: item.description || item.name,
              amount: itemValue,
              quantity: quantity,
              type: 'produto'
            });
          }
        });
      }

      // Se não há produtos especificados, considerar tudo como serviço
      if (serviceAmount === 0 && productAmount === 0) {
        serviceAmount = parseFloat(amount);
        serviceDetails.push({
          name: service.name || 'Serviço técnico',
          amount: parseFloat(amount),
          type: 'servico'
        });
      }

      const transactionData = {
        description: serviceName, // NOME ORIGINAL DO SERVIÇO COMO TÍTULO
        resolution: serviceDescription, // DISCRIMINAÇÃO DETALHADA DOS VALORES
        clientId: service.clientId, // USAR O CLIENTE DO SERVIÇO!
        serviceId: service.id, // REFERÊNCIA AO SERVIÇO ORIGINAL
        amount: (serviceAmount + productAmount).toString(), // VALOR TOTAL CALCULADO CORRETAMENTE
        serviceAmount: serviceAmount.toString(), // VALOR DOS SERVIÇOS
        productAmount: productAmount.toString(), // VALOR DOS PRODUTOS
        serviceDetails: JSON.stringify(serviceDetails), // DETALHES DOS SERVIÇOS
        productDetails: JSON.stringify(productDetails), // DETALHES DOS PRODUTOS
        type: "entrada",
        status: "pendente",
        userId: service.userId || service.createdByUserId || loggedUser?.id || 1, // PRESERVAR usuário original do serviço
        createdByUserId: service.userId || service.createdByUserId || loggedUser?.id || 1, // PRESERVAR criador original
        // PRESERVAR TODAS AS DATAS DO WORKFLOW
        callDate: service.callDate, // Data do chamado original
        serviceDate: service.serviceDate || service.createdAt, // Data do serviço
        billingDate: new Date().toISOString(), // Data de cobrança atual
      };

      console.log("Dados da transação:", transactionData);

      const response = await apiRequest("POST", "/api/financial-transactions", transactionData);
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const newTransaction = await response.json();
      console.log("Transação criada:", newTransaction);

      // Deletar serviço sem enviar notificação (é deleção automática do sistema)
      const deleteResponse = await apiRequest("DELETE", `/api/services/${service.id}`, {
        skipNotification: true,
        userId: loggedUser?.id || 1
      });
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete service");
      }

      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      toast({
        title: "Sucesso",
        description: "Serviço enviado para faturamento com sucesso!",
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



  const handleEdit = (service: Service) => {
    setEditingService(service);
    const serviceDate = service.serviceDate ? new Date(service.serviceDate).toISOString().split('T')[0] : "";
    form.reset({
      name: service.name,
      description: service.description || "",
      priority: (service as any).priority || "media",
      clientId: service.clientId || undefined,
      serviceDate: serviceDate,
      createdByUserId: (service as any).createdByUserId || service.userId,
    });
    setShowServiceDialog(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    form.reset();
    setShowServiceDialog(true);
  };

  // Funções para editar produtos de um serviço
  const handleOpenEditProducts = (service: Service) => {
    setSelectedService(service);
    
    // Parse produtos existentes
    if (service.products) {
      try {
        const parsedProducts = JSON.parse(service.products);
        setEditingProducts(parsedProducts);
      } catch (error) {
        console.error("Erro ao fazer parse dos produtos:", error);
        setEditingProducts([]);
      }
    } else {
      setEditingProducts([]);
    }
    
    setShowEditProductsDialog(true);
  };

  const handleAddProductItem = () => {
    if (!newProductItem.name || !newProductItem.unitPrice || !newProductItem.quantity) {
      toast({
        title: "Atenção",
        description: "Preencha o nome, valor unitário e quantidade do item",
        variant: "destructive",
      });
      return;
    }

    const unitPrice = parseFloat(newProductItem.unitPrice);
    const quantity = parseInt(newProductItem.quantity);
    const totalPrice = unitPrice * quantity;

    const newItem = {
      name: newProductItem.name,
      description: newProductItem.name,
      type: newProductItem.type,
      unitPrice: unitPrice,
      price: totalPrice,
      amount: totalPrice,
      quantity: quantity
    };

    if (editingProductIndex >= 0) {
      // Editando item existente
      const updatedProducts = [...editingProducts];
      updatedProducts[editingProductIndex] = newItem;
      setEditingProducts(updatedProducts);
      setEditingProductIndex(-1);
    } else {
      // Adicionando novo item
      setEditingProducts([...editingProducts, newItem]);
    }

    setNewProductItem({ name: "", type: "produto", unitPrice: "", quantity: "1", totalPrice: "0.00", inventoryId: null, inventoryType: null });
    setIsManualMode(false);
  };

  const handleEditProductItem = (index: number) => {
    const item = editingProducts[index];
    const unitPrice = item.unitPrice?.toString() || (item.quantity > 0 ? (parseFloat(item.price || item.amount || 0) / item.quantity).toFixed(2) : "0.00");
    setNewProductItem({
      name: item.name || item.description,
      type: item.type || "produto",
      unitPrice: unitPrice,
      quantity: item.quantity?.toString() || "1",
      totalPrice: (item.price || item.amount || 0).toString(),
      inventoryId: item.inventoryId || null,
      inventoryType: item.inventoryType || null
    });
    setEditingProductIndex(index);
  };

  const handleRemoveProductItem = (index: number) => {
    setEditingProducts(editingProducts.filter((_, i) => i !== index));
  };

  const handleSaveProducts = () => {
    if (selectedService) {
      updateServiceProductsMutation.mutate({
        id: selectedService.id,
        products: editingProducts
      });
    }
  };

  const handleDelete = (service: Service) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const handleSendToInvoice = (service: Service) => {
    setSelectedService(service);
    
    // Calcular valor total apenas dos produtos/serviços cadastrados
    let totalValue = 0;
    
    if (service.products) {
      try {
        const products = JSON.parse(service.products);
        totalValue = products.reduce((sum: number, product: any) => 
          sum + parseFloat(product.price || product.amount || "0"), 0
        );
      } catch (error) {
        console.error("Erro ao calcular valor dos produtos:", error);
        totalValue = 0;
      }
    }
    
    console.log("=== CÁLCULO VALOR FATURAMENTO ===");
    console.log("Produtos/Serviços:", totalValue);
    console.log("Total calculado:", totalValue.toFixed(2));
    
    setInvoiceValue(totalValue.toFixed(2));
    setShowInvoiceDialog(true);
  };

  const handleGenerateQuote = async (service: Service) => {
    try {
      const client = clients?.find(c => c.id === service.clientId);
      if (!client) {
        toast({
          title: "Erro",
          description: "Cliente não encontrado para este serviço.",
          variant: "destructive",
        });
        return;
      }

      // Calculate total value from products/services
      let totalValue = 0;
      if (service.products) {
        try {
          const products = JSON.parse(service.products);
          totalValue = products.reduce((sum: number, product: any) => 
            sum + parseFloat(product.price || product.amount || "0"), 0
          );
        } catch (error) {
          console.error("Erro ao calcular valor dos produtos:", error);
          totalValue = 0;
        }
      }

      // Convert service data to quote format
      const quoteData = {
        id: service.id,
        title: service.name || "Orçamento de Serviço",
        description: service.description || "",
        items: service.products || "[]",
        total: totalValue.toString()
      };

      console.log("=== GERANDO ORÇAMENTO DO SERVIÇO ===");
      console.log("Service:", service);
      console.log("Client:", client);
      console.log("Quote data:", quoteData);

      // Generate PDF and ask about signature
      const result = await generateQuotePDF(quoteData, client);
      if (result) {
        setPdfData(result);
        
        // Prepare PDF blob for signature
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        setPdfBlobForSign(blob);
        setServiceForSign(service);
        
        // Ask if user wants to sign
        setAskSignatureModalOpen(true);
      }

      // Send notification
      try {
        await apiRequest("POST", "/api/telegram-notification", {
          action: "quote_generated",
          service: service,
          client: client,
          currentUserId: loggedUser?.id || 1,
          userName: loggedUser?.name || "Sistema"
        });
      } catch (notificationError) {
        console.error("Erro ao enviar notificação:", notificationError);
      }
      
      toast({
        title: "Sucesso",
        description: "Orçamento gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar orçamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSignatureResponse = (wantToSign: boolean) => {
    setAskSignatureModalOpen(false);
    setShouldSignDocument(wantToSign);
    
    if (wantToSign) {
      setSignatureModalOpen(true);
    } else {
      setPdfViewerOpen(true);
    }
  };

  const confirmInvoice = () => {
    if (!selectedService || !invoiceValue) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    transformServiceToInvoiceMutation.mutate({
      service: selectedService,
      amount: invoiceValue,
    });
    setShowInvoiceDialog(false);
    setSelectedService(null);
    setInvoiceValue("");
  };

  const handleViewService = (service: Service) => {
    console.log("Visualizar serviço:", service);
    setSelectedService(service);
  };

  // Funções para edição de produtos/serviços
  const handleEditProducts = (service: Service) => {
    console.log("=== INICIANDO EDIÇÃO DE PRODUTOS ===");
    console.log("Serviço selecionado:", service);
    
    setEditingService(service);
    // Parse dos produtos existentes
    let products = [];
    if (service.products) {
      try {
        products = JSON.parse(service.products);
        console.log("Produtos existentes encontrados:", products);
      } catch (e) {
        console.log("Erro ao fazer parse dos produtos:", e);
        products = [];
      }
    } else {
      console.log("Nenhum produto existente, iniciando lista vazia");
    }
    
    setEditingProducts([...products]);
    setNewProductItem({ name: "", type: "produto", unitPrice: "", quantity: "1", totalPrice: "0.00", inventoryId: null, inventoryType: null });
    setIsManualMode(false);
    setShowEditProductsDialog(true);
  };

  const addProductItem = () => {
    if (newProductItem.name.trim() && newProductItem.unitPrice.trim() && newProductItem.quantity.trim()) {
      const unitPriceValue = parseFloat(newProductItem.unitPrice);
      const quantityValue = parseInt(newProductItem.quantity);
      if (isNaN(unitPriceValue) || unitPriceValue <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor unitário válido maior que zero.",
          variant: "destructive",
        });
        return;
      }
      if (isNaN(quantityValue) || quantityValue <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira uma quantidade válida maior que zero.",
          variant: "destructive",
        });
        return;
      }
      
      const totalPrice = unitPriceValue * quantityValue;
      
      const newItem = {
        name: newProductItem.name.trim(),
        description: newProductItem.name.trim(),
        type: newProductItem.type,
        unitPrice: unitPriceValue,
        price: totalPrice,
        amount: totalPrice,
        quantity: quantityValue,
        inventoryId: newProductItem.inventoryId,
        inventoryType: newProductItem.inventoryType
      };
      
      console.log("Adicionando novo item:", newItem);
      setEditingProducts(prev => [...prev, newItem]);
      setNewProductItem({ name: "", type: "produto", unitPrice: "", quantity: "1", totalPrice: "0.00", inventoryId: null, inventoryType: null });
      setIsManualMode(false);
      
      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso!",
      });
    } else {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const removeProductItem = (index: number) => {
    const updated = editingProducts.filter((_, i) => i !== index);
    setEditingProducts(updated);
  };

  const updateProductItem = (index: number, item: any) => {
    const updated = [...editingProducts];
    updated[index] = item;
    setEditingProducts(updated);
  };

  const saveProductChanges = async () => {
    console.log("🔧 INICIANDO saveProductChanges - Cliente:", editingService?.clientId, "Clients array:", clients.length);
    if (!editingService) {
      toast({
        title: "Erro",
        description: "Nenhum serviço selecionado para edição.",
        variant: "destructive",
      });
      return;
    }
    
    // Calcular valor total com validação
    const totalValue = getTotalProductsValue();
    
    console.log("=== SALVANDO PRODUTOS ===");
    console.log("Serviço:", editingService.id);
    console.log("Produtos a salvar:", editingProducts);
    console.log("Valor total calculado:", totalValue);
    
    const dataToSend = {
      name: editingService.name,
      description: editingService.description,
      basePrice: totalValue.toFixed(2),
      category: editingService.category,
      clientId: editingService.clientId,
      products: JSON.stringify(editingProducts),
      currentUserId: validatedLoggedUserId
    };
    
    try {
      const response = await apiRequest("PATCH", `/api/services/${editingService.id}`, dataToSend);
      
      if (response.ok) {
        const updatedService = await response.json();
        console.log("Serviço atualizado:", updatedService);
        
        // Fazer movimentação de estoque
        try {
          // Buscar todos os produtos do inventário para matching por nome
          const inventoryResponse = await fetch("/api/inventory/products");
          const inventoryProducts = inventoryResponse.ok ? await inventoryResponse.json() : [];
          console.log("📦 Produtos do inventário carregados:", inventoryProducts.length);
          
          // Produtos antigos (antes da edição)
          let oldProducts: any[] = [];
          if (editingService.products) {
            try {
              oldProducts = JSON.parse(editingService.products);
              console.log("📋 Produtos antigos:", oldProducts.length);
            } catch (e) {
              console.log("Sem produtos antigos");
            }
          }
          
          // DEVOLVER PRODUTOS REMOVIDOS
          console.log("🔄 Comparando produtos antigos vs novos para devoluções...");
          for (const oldProduct of oldProducts) {
            const stillExists = editingProducts.some(p => 
              p.name.toLowerCase().trim() === oldProduct.name.toLowerCase().trim()
            );
            
            if (!stillExists && (oldProduct.type === "produto" || oldProduct.inventoryType === "product")) {
              console.log(`↩️  Produto REMOVIDO: "${oldProduct.name}" - devolvendo ${oldProduct.quantity} unidades`);
              
              let productIdToReturn = oldProduct.inventoryId;
              if (!productIdToReturn) {
                const foundProduct = inventoryProducts.find((p: any) => 
                  p.name.toLowerCase().trim() === oldProduct.name.toLowerCase().trim()
                );
                productIdToReturn = foundProduct?.id;
              }
              
              if (productIdToReturn) {
                try {
                  const clientName = editingService?.clientId ? (clients.find(c => c.id === editingService.clientId)?.name || `ID${editingService.clientId}`) : "Sem cliente";
                  console.log(`💾 Devolvendo: clientId=${editingService?.clientId}, clientName=${clientName}`);
                  await apiRequest("POST", "/api/inventory/movements", {
                    productId: productIdToReturn,
                    type: "entrada",
                    quantity: parseInt(oldProduct.quantity) || 1,
                    reference: `service_${editingService.id}`,
                    notes: `Devolvido - removido do cliente: ${clientName}`
                  });
                  console.log(`✅ Devolução realizada: ${oldProduct.name}`);
                } catch (err) {
                  console.error(`❌ Erro ao devolver:`, err);
                }
              }
            }
          }
          
          // SUBTRAIR PRODUTOS NOVOS/ATUALIZADOS
          console.log("🔄 Comparando produtos novos vs antigos para deduções...");
          for (const product of editingProducts) {
            const wasNew = !oldProducts.some(p => 
              p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
            );
            
            if (wasNew && (product.type === "produto" || product.inventoryType === "product")) {
              console.log(`➕ Produto NOVO: "${product.name}" - deducindo ${product.quantity} unidades`);
              
              let productIdToDeduct = product.inventoryId;
              
              if (!productIdToDeduct) {
                const foundProduct = inventoryProducts.find((p: any) => 
                  p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
                );
                if (foundProduct) {
                  productIdToDeduct = foundProduct.id;
                  console.log(`✓ Produto encontrado: "${foundProduct.name}" (ID: ${foundProduct.id})`);
                }
              }
              
              if (productIdToDeduct) {
                try {
                  console.log(`📉 SUBTRAINDO ${product.quantity} unidades do produto ID ${productIdToDeduct}`);
                  const clientName = editingService?.clientId ? (clients.find(c => c.id === editingService.clientId)?.name || `ID${editingService.clientId}`) : "Sem cliente";
                  console.log(`🔍 DEBUG - clientId=${editingService?.clientId}, clientName="${clientName}", clients.length=${clients.length}`);
                  
                  const movementData = {
                    productId: productIdToDeduct,
                    type: "saida",
                    quantity: parseInt(product.quantity) || 1,
                    reference: `service_${editingService.id}`,
                    notes: `Utilizado no cliente: ${clientName}`
                  };
                  console.log(`💾 Enviando movimento para API:`, JSON.stringify(movementData, null, 2));
                  
                  const response = await apiRequest("POST", "/api/inventory/movements", movementData);
                  console.log(`✅ Resposta da API:`, response);
                  console.log(`✅ Subtração realizada: ${product.name}`);
                } catch (err) {
                  console.error(`❌ ERRO ao subtrair:`, err);
                }
              }
            }
          }
        } catch (inventoryErr) {
          console.error("❌ Erro ao processar movimentações:", inventoryErr);
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
        
        toast({
          title: "Sucesso",
          description: `Produtos/serviços atualizados! Valor total: R$ ${totalValue.toFixed(2).replace('.', ',')}`,
        });
        setShowEditProductsDialog(false);
        setEditingProducts([]);
        setEditingService(null);
        setNewProductItem({ name: "", type: "produto", unitPrice: "", quantity: "1", totalPrice: "0.00", inventoryId: null, inventoryType: null });
        setIsManualMode(false);
      } else {
        const errorData = await response.text();
        console.error("Erro do servidor:", errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error("Erro ao salvar produtos:", error);
      toast({
        title: "Erro",
        description: `Erro ao salvar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  // Calcular valor total dos produtos em edição
  const getTotalProductsValue = () => {
    return editingProducts.reduce((sum, item) => {
      const value = parseFloat(item.price || item.amount || 0);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const handleAddProduct = (service: Service) => {
    setSelectedService(service);
    setProductName("");
    setProductPrice("");
    setShowProductDialog(true);
  };

  const addProductMutation = useMutation({
    mutationFn: async ({ service, product }: { service: Service; product: { name: string; price: string } }) => {
      const currentProducts = service.products ? JSON.parse(service.products) : [];
      const newProducts = [...currentProducts, product];
      
      // PRESERVAR TODOS OS DADOS DO SERVIÇO ao adicionar produto
      const response = await apiRequest("PATCH", `/api/services/${service.id}`, {
        name: service.name,
        description: service.description,
        clientId: service.clientId, // CRÍTICO: preservar cliente
        products: JSON.stringify(newProducts)
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setShowProductDialog(false);
      setProductName("");
      setProductPrice("");
      toast({
        title: "Sucesso",
        description: "Produto adicionado ao serviço!",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof serviceFormSchema>) => {
    console.log("=== SERVICE FORM SUBMIT ===");
    console.log("Form data:", data);
    console.log("ServiceDate original:", data.serviceDate);
    
    // Se não selecionou data, usar hoje
    let processedDate: Date;
    
    if (data.serviceDate && data.serviceDate.trim()) {
      // Se é string no formato YYYY-MM-DD, criar data local
      if (typeof data.serviceDate === 'string') {
        const dateParts = data.serviceDate.split('-');
        processedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      } else {
        processedDate = new Date(data.serviceDate);
      }
    } else {
      // Se não selecionou data, usar HOJE em hora local
      const today = new Date();
      processedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    console.log("Processed date:", processedDate);
    console.log("Processed date ISO:", processedDate.toISOString());
    
    // Adicionar createdAt sincronizado com serviceDate para preservação
    const serviceData = {
      ...data,
      serviceDate: processedDate.toISOString(),
      createdAt: processedDate.toISOString(), // SINCRONIZAR COM serviceDate
      createdByUserId: data.createdByUserId || validatedLoggedUserId,
    };
    
    console.log("Service data to send:", serviceData);
    
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-400 mb-2">Serviços em Andamento</h2>
          <p className="text-gray-400">Gerencie e acompanhe o progresso dos serviços com informações detalhadas dos clientes</p>
        </div>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 border-4 border-indigo-500 dark:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/50 dark:shadow-indigo-500/20 shadow-lg w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Estatísticas de Prioridade - Clicáveis para Filtrar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <Card 
          onClick={() => setPriorityFilter(priorityFilter === "" ? "" : "")}
          className={`bg-background dark:bg-slate-800 border-4 border-primary dark:border-blue-500 hover:shadow-lg hover:shadow-blue-600/50 shadow-lg dark:shadow-blue-600/20 transition-all cursor-pointer h-28 ${priorityFilter === "" ? "ring-4 ring-blue-400 scale-105" : ""}`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-sm font-semibold text-primary dark:text-blue-400 mb-2">Total</p>
            <p className="text-3xl font-bold text-primary dark:text-blue-400">{totalServices}</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setPriorityFilter(priorityFilter === "urgente" ? "" : "urgente")}
          className={`bg-background dark:bg-slate-800 border-4 border-red-600 dark:border-red-500 hover:shadow-lg hover:shadow-red-600/50 shadow-lg dark:shadow-red-600/20 transition-all cursor-pointer h-28 ${priorityFilter === "urgente" ? "ring-4 ring-red-400 scale-105" : ""}`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Urgente</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{urgenteCount}</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setPriorityFilter(priorityFilter === "alta" ? "" : "alta")}
          className={`bg-background dark:bg-slate-800 border-4 border-orange-600 dark:border-orange-500 hover:shadow-lg hover:shadow-orange-600/50 shadow-lg dark:shadow-orange-600/20 transition-all cursor-pointer h-28 ${priorityFilter === "alta" ? "ring-4 ring-orange-400 scale-105" : ""}`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">Alta</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{altaCount}</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setPriorityFilter(priorityFilter === "media" ? "" : "media")}
          className={`bg-background dark:bg-slate-800 border-4 border-yellow-500 dark:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 shadow-lg dark:shadow-yellow-500/20 transition-all cursor-pointer h-28 ${priorityFilter === "media" ? "ring-4 ring-yellow-300 scale-105" : ""}`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Média</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{mediaCount}</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setPriorityFilter(priorityFilter === "baixa" ? "" : "baixa")}
          className={`bg-background dark:bg-slate-800 border-4 border-green-600 dark:border-green-500 hover:shadow-lg hover:shadow-green-600/50 shadow-lg dark:shadow-green-600/20 transition-all cursor-pointer h-28 ${priorityFilter === "baixa" ? "ring-4 ring-green-400 scale-105" : ""}`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-4">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Baixa</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{baixaCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Mobile Optimized */}
      <Card className="mb-6 bg-background dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Filtros
              <span className={`text-sm transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
            </CardTitle>
          </div>
        </CardHeader>
        {showFilters && (
        <CardContent className="space-y-4">
          {/* Primary Filters Row - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Busca */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Cliente
              </label>
              <ClientFilter
                value={clientFilter}
                onChange={setClientFilter}
                placeholder="Selecionar..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Período
              </label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os períodos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Últimos 7 dias</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="customizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Usuário Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Criado Por
              </label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Prioridade
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-10 bg-background dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as prioridades</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Range for Custom Period */}
          {periodFilter === "customizado" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  📅 Data Inicial
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Selecionar data..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date: Date) =>
                        customEndDate ? date > customEndDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  📅 Data Final
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Selecionar data..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date: Date) =>
                        customStartDate ? date < customStartDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          <div className="flex items-end pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSearchTerm("");
                setClientFilter("");
                setStatusFilter("");
                setUserFilter("todos");
                setPriorityFilter("");
                setPeriodFilter("todos");
                setCustomStartDate(undefined);
                setCustomEndDate(undefined);
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Services List - New Improved Layout */}
      {isLoading ? (
        <div className={`grid ${getGridClass()} gap-6`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-4 border-blue-700 dark:border-primary hover:shadow-lg hover:shadow-blue-700/50 shadow-lg dark:shadow-blue-700/20 transition-all">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-100 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 w-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="bg-background dark:bg-slate-800 border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Wrench className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 font-semibold">Nenhum serviço encontrado</p>
            <p className="text-gray-500 dark:text-gray-400">
              {services.length === 0 
                ? "Não há serviços cadastrados no momento. Comece adicionando um novo serviço."
                : "Tente ajustar os filtros para encontrar o que procura."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {filteredServices
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((service) => (
            <Card key={service.id} className={`bg-background dark:bg-slate-800 border-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group flex flex-col h-full shadow-lg ${
              service.priority === "urgente" ? "border-red-500 dark:border-red-400 hover:shadow-red-500/50 dark:shadow-red-500/20" :
              service.priority === "alta" ? "border-orange-500 dark:border-orange-400 hover:shadow-orange-500/50 dark:shadow-orange-500/20" :
              service.priority === "media" ? "border-yellow-500 dark:border-yellow-400 hover:shadow-yellow-500/50 dark:shadow-yellow-500/20" :
              "border-green-500 dark:border-green-400 hover:shadow-green-500/50 dark:shadow-green-500/20"
            }`}>
              <CardContent className="p-0 flex flex-col flex-1 relative">
                {/* Badge de prioridade no canto superior esquerdo */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="outline" className={`${getPriorityColor(service.priority || "media")} text-xs h-5 px-2 border font-semibold`}>
                    {getPriorityLabel(service.priority || "media")}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3 flex-1">
                  {/* Linha 1: Cliente label e Criado Por com mais espaço */}
                  <div className="flex items-start justify-between gap-2 mb-1 mt-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">Cliente</p>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Criado Por</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-xs text-right">{users?.find(u => u.id === (service.createdByUserId ?? service.userId))?.name || "Sistema"}</p>
                    </div>
                  </div>

                  {/* Linha 2: Nome do cliente e data */}
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm break-words flex-1">
                      {clients?.find(c => c.id === service.clientId)?.name || "Sem cliente"}
                    </p>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                      {service.serviceDate ? format(new Date(service.serviceDate), "dd/MM/yyyy") : formatDate(service.createdAt).split(" ")[0]}
                    </span>
                  </div>
                  

                  {/* Nome do serviço */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Serviço</p>
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-3 text-sm">
                      {service.name}
                    </p>
                  </div>

                  {/* Descrição - com mais espaço disponível */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {service.description || "Sem descrição"}
                    </p>
                  </div>

                  {/* Valor Total (se houver produtos/serviços) */}
                  {service.products && JSON.parse(service.products).length > 0 && (() => {
                    const items = JSON.parse(service.products!);
                    const valorTotal = items.reduce((sum: number, item: any) => sum + parseFloat(item.price || item.amount || "0"), 0);
                    return (
                      <div className="pt-1">
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(valorTotal.toFixed(2))}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Ações - grid compacto na parte inferior - SEMPRE NO BOTTOM */}
                <div className="p-4 pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                        }}
                        className="h-8 text-xs text-cyan-400 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex flex-col items-center justify-center p-1"
                        title="Ver Detalhes"
                        data-testid={`button-view-${service.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(service);
                        }}
                        className="h-8 text-xs text-indigo-400 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex flex-col items-center justify-center p-1"
                        title="Editar Serviço"
                        data-testid={`button-edit-${service.id}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProducts(service);
                        }}
                        className="h-8 text-xs text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col items-center justify-center p-1"
                        title="Gerenciar Produtos/Serviços"
                        data-testid={`button-products-${service.id}`}
                      >
                        <Package className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateQuote(service);
                        }}
                        className="h-8 text-xs text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex flex-col items-center justify-center p-1"
                        title="Gerar Orçamento PDF"
                        data-testid={`button-pdf-${service.id}`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToInvoice(service);
                        }}
                        className="h-8 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex flex-col items-center justify-center p-1"
                        title="Finalizar e Faturar"
                        data-testid={`button-invoice-${service.id}`}
                        disabled={transformServiceToInvoiceMutation.isPending}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(service);
                        }}
                        className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col items-center justify-center p-1"
                        title="Deletar Serviço"
                        data-testid={`button-delete-${service.id}`}
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

      {/* Modal de Criação/Edição de Serviço - CORRIGIDO E COMPLETO */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Serviço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Reparo de notebook" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Serviço</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""} 
                          className="h-11"
                        />
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhadamente o serviço a ser realizado..." 
                        {...field} 
                        value={field.value || ""} 
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <FormControl>
                      <Select value={field.value || "media"} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgente">Urgente</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (opcional)</FormLabel>
                    <FormControl>
                      <ClientSearch
                        value={field.value}
                        onSelect={(clientId, client) => {
                          field.onChange(clientId || undefined);
                        }}
                        placeholder="Digite para buscar um cliente (opcional)..."
                        allowEmpty={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdByUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criado Por</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || ""} onValueChange={(v) => field.onChange(parseInt(v))}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name || user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowServiceDialog(false);
                    setEditingService(null);
                    form.reset();
                  }}
                  className="min-w-[100px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  className="min-w-[120px]"
                >
                  {(createServiceMutation.isPending || updateServiceMutation.isPending)
                    ? "Salvando..." 
                    : editingService ? "Atualizar Serviço" : "Criar Serviço"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg">Adicionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Nome do Produto
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Memória RAM 8GB"
                className="w-full h-11"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Preço (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-11"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => {
                  if (selectedService && productName && productPrice) {
                    addProductMutation.mutate({
                      service: selectedService,
                      product: { name: productName, price: productPrice }
                    });
                  }
                }}
                disabled={!productName || !productPrice || addProductMutation.isPending}
                className="w-full h-11"
              >
                {addProductMutation.isPending ? "Adicionando..." : "Adicionar Produto"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowProductDialog(false)}
                className="w-full h-10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Service Modal - NEW MODAL */}
      <ServiceDetailsModal 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
        service={selectedService} 
      />

      {/* Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg">Enviar para Faturamento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedService && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Serviço:</strong> {selectedService.name}
                </p>
                {selectedService.products && JSON.parse(selectedService.products).length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Total dos itens:</strong> {formatCurrency(
                      JSON.parse(selectedService.products).reduce((sum: number, product: any) => 
                        sum + parseFloat(product.price || product.amount || "0"), 0).toFixed(2)
                    )}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Valor para faturamento:
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                value={invoiceValue}
                onChange={(e) => setInvoiceValue(e.target.value)}
                className="w-full h-12 text-base"
                autoFocus
              />
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={confirmInvoice}
                disabled={transformServiceToInvoiceMutation.isPending || !invoiceValue}
                className="w-full h-12 text-base"
              >
                {transformServiceToInvoiceMutation.isPending ? "Processando..." : "Confirmar Faturamento"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowInvoiceDialog(false);
                  setSelectedService(null);
                  setInvoiceValue("");
                }}
                className="w-full h-10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Produtos */}
      <Dialog open={showEditProductsDialog} onOpenChange={setShowEditProductsDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg">Editar Produtos e Serviços</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Lista de Produtos/Serviços Existentes */}
            {editingProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Itens Atuais</h4>
                <div className="space-y-2">
                  {editingProducts.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border-4 ${
                      item.type === 'servico' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === 'servico' ? 'default' : 'secondary'}>
                            {item.type === 'servico' ? '🔧 Serviço' : '📦 Produto'}
                          </Badge>
                          <span className="font-medium">
                            {item.quantity && item.quantity > 1 ? (
                              `${item.quantity}x ${item.name || item.description}`
                            ) : (
                              item.name || item.description
                            )}
                            {item.unitPrice && item.quantity > 1 && (
                              <span className="text-sm text-gray-500 ml-1">
                                (R$ {parseFloat(item.unitPrice).toFixed(2).replace('.', ',')} cada)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          R$ {parseFloat(item.price || item.amount || 0).toFixed(2).replace('.', ',')}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProductItem(index)}
                          className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveProductItem(index)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Valor Total */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Valor Total:</span>
                    <span className="text-xl font-bold text-primary dark:text-blue-400">
                      R$ {getTotalProductsValue().toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário para Adicionar Novo Item */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Adicionar Novo Item</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manualMode"
                    checked={isManualMode}
                    onChange={(e) => {
                      setIsManualMode(e.target.checked);
                      if (e.target.checked) {
                        // Limpar dados do inventário ao ativar modo manual
                        setNewProductItem({
                          ...newProductItem,
                          inventoryId: null,
                          inventoryType: null
                        });
                      } else {
                        // Limpar nome ao desativar modo manual
                        setNewProductItem({
                          ...newProductItem,
                          name: "",
                          unitPrice: "",
                          totalPrice: "0.00"
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                  />
                  <label htmlFor="manualMode" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Modo Manual
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Busca do Inventário (visível quando NÃO está em modo manual) */}
                {!isManualMode ? (
                  <div className="md:col-span-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Buscar Produto ou Serviço
                    </label>
                    <InventoryItemSearch
                      onSelect={(item) => {
                        const itemType = item.type === "product" ? "produto" : "servico";
                        setNewProductItem({
                          ...newProductItem,
                          name: item.name,
                          type: itemType,
                          unitPrice: item.price.toString(),
                          totalPrice: calculateTotalPrice(item.price.toString(), newProductItem.quantity),
                          inventoryId: item.id,
                          inventoryType: item.type
                        });
                      }}
                    />
                  </div>
                ) : (
                  /* Campo de nome manual (visível quando está em modo manual) */
                  <div className="md:col-span-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Nome do Produto/Serviço
                    </label>
                    <Input
                      type="text"
                      placeholder="Digite o nome..."
                      value={newProductItem.name}
                      onChange={(e) =>
                        setNewProductItem({
                          ...newProductItem,
                          name: e.target.value
                        })
                      }
                      className="h-11"
                    />
                  </div>
                )}

                {/* Tipo - sempre visível */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Tipo
                  </label>
                  <Select
                    value={newProductItem.type}
                    onValueChange={(value: "produto" | "servico") => 
                      setNewProductItem({ ...newProductItem, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servico">🔧 Serviço</SelectItem>
                      <SelectItem value="produto">📦 Produto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantidade - sempre visível */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newProductItem.quantity}
                    onChange={(e) => {
                      const newQuantity = e.target.value;
                      const totalPrice = calculateTotalPrice(newProductItem.unitPrice, newQuantity);
                      setNewProductItem({ 
                        ...newProductItem, 
                        quantity: newQuantity,
                        totalPrice: totalPrice
                      });
                    }}
                  />
                </div>

                {/* Valor Unitário - sempre visível */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Valor Unitário (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newProductItem.unitPrice}
                    onChange={(e) => {
                      const newUnitPrice = e.target.value;
                      const totalPrice = calculateTotalPrice(newUnitPrice, newProductItem.quantity);
                      setNewProductItem({ 
                        ...newProductItem, 
                        unitPrice: newUnitPrice,
                        totalPrice: totalPrice
                      });
                    }}
                  />
                </div>

                {/* Total - sempre visível */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Total (R$)
                  </label>
                  <Input
                    type="text"
                    value={`R$ ${newProductItem.totalPrice.replace('.', ',')}`}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  />
                </div>

                {/* Botão Adicionar */}
                <div className="md:col-span-1 flex items-end">
                  <Button
                    onClick={handleAddProductItem}
                    disabled={!newProductItem.name || !newProductItem.unitPrice || !newProductItem.quantity}
                    className="w-full"
                    data-testid="button-add-product-item"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditProductsDialog(false);
                  setEditingProducts([]);
                  setEditingService(null);
                  setNewProductItem({ name: "", type: "produto", unitPrice: "", quantity: "1", totalPrice: "0.00", inventoryId: null, inventoryType: null });
                  setIsManualMode(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveProductChanges}
                disabled={editingProducts.length === 0}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer */}
      {pdfData && (
        <PDFViewer
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          pdfDataUrl={pdfData.dataUrl}
          filename={pdfData.filename}
        />
      )}

      {/* Ask Signature Modal */}
      <AlertDialog open={askSignatureModalOpen} onOpenChange={setAskSignatureModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assinar Documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja assinar digitalmente este orçamento antes de compartilhar ou visualizar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleSignatureResponse(false)}>
              Não, apenas visualizar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSignatureResponse(true)}>
              Sim, assinar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => {
          setSignatureModalOpen(false);
          setPdfViewerOpen(true);
        }}
        pdfBlob={pdfBlobForSign}
        documentType="quotation"
        documentId={serviceForSign?.id || 0}
        documentName={pdfData?.filename?.replace('.pdf', '') || `orcamento_${serviceForSign?.id}`}
        userId={loggedUser?.id}
        onDownloadOriginal={() => {
          if (pdfData) {
            const a = document.createElement('a');
            a.href = pdfData.dataUrl;
            a.download = pdfData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }}
        onSignSuccess={(signedPdfBase64) => {
          // Converter PDF assinado base64 para dataUrl
          const dataUrl = `data:application/pdf;base64,${signedPdfBase64}`;
          setPdfData({
            dataUrl,
            filename: pdfData?.filename || `orcamento_${serviceForSign?.id}.pdf`
          });
        }}
      />
    </div>
  );
}