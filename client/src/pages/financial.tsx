import { useState, useMemo, useEffect, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCardLayout } from "@/hooks/use-card-layout";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Search, FileText, Download, TrendingUp, TrendingDown, Clock, Plus, Trash2, Eye, Edit, Check, Receipt, User, Calendar, CreditCard, X, Percent, Copy, Settings, Bell, ChevronDown } from "lucide-react";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { ClientSearch } from "@/components/ClientSearch";
import { ClientFilter } from "@/components/ClientFilter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialTransactionWithClient, Client } from "@shared/schema";
import { insertFinancialTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { generateReceiptPDF, generateServiceNotePDF, generateFinancialReportPDF } from "@/utils/professionalPdfGenerator";
import { PDFViewer } from "@/components/PDFViewer";
import { SignatureModal } from "@/components/SignatureModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Função para limpar descrições de transações - PRESERVANDO MAIS CONTEÚDO
function getCleanDescription(description: string): string {
  if (!description) return "Nenhuma descrição disponível";
  
  try {
    // Preservar a descrição original tanto quanto possível
    let cleanText = description;
    
    // Remove apenas arrays JSON no final da descrição
    cleanText = cleanText.replace(/\[\{.*\}\]\s*$/g, '');
    
    // Remove apenas chaves de template óbvias
    cleanText = cleanText.replace(/\{\{[^}]*\}\}/g, '');
    
    // Preservar "Discriminação de valores" mas remover dados estruturados após isso
    const discriminacaoIndex = cleanText.indexOf('Discriminação de valores:');
    if (discriminacaoIndex !== -1) {
      // Manter até "Discriminação de valores" mas remover dados estruturados depois
      const beforeDiscriminacao = cleanText.substring(0, discriminacaoIndex).trim();
      const afterDiscriminacao = cleanText.substring(discriminacaoIndex);
      // Manter apenas a primeira parte da discriminação, removendo JSON
      const cleanAfter = afterDiscriminacao.split('\n')
        .filter(line => !line.includes('[{') && !line.includes('}]'))
        .join('\n');
      cleanText = (beforeDiscriminacao + '\n\n' + cleanAfter).trim();
    }
    
    // Limpar linhas vazias excessivas, mas preservar estrutura
    const lines = cleanText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Retornar a descrição completa preservada
    const result = lines.join('\n').trim();
    
    return result || "Descrição não disponível";
  } catch (error) {
    console.error("Erro ao limpar descrição:", error);
    // Em caso de erro, retornar a descrição original
    return description || "Descrição não disponível";
  }
}

const transactionFormSchema = insertFinancialTransactionSchema.extend({
  clientId: z.coerce.number().optional(),
  amount: z.string().min(1, "Valor é obrigatório"),
  resolution: z.string().optional(),
  createdAt: z.string().optional(),
  installmentCount: z.string().optional(),
  installmentValues: z.string().optional(),
  userId: z.coerce.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

// History Timeline Component - Memoized for performance
const HistoryTimeline = memo(function HistoryTimeline({ transactionId }: { transactionId: number }) {
  const { data: events = [] } = useQuery<any[]>({
    queryKey: [`/api/history/transaction/${transactionId}`],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  if (events.length === 0) {
    return null;
  }

  const eventLabels: Record<string, string> = {
    call_created: 'Chamado Criado',
    converted_to_service: 'Convertido em Serviço',
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

export default function Financial({ currentUser }: { currentUser?: any }) {
  // Garantir que temos o usuário atual
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const { layout, updateLayout, getGridClass } = useCardLayout();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLayoutChange = () => forceUpdate({});
    window.addEventListener("layoutChange", handleLayoutChange);
    return () => window.removeEventListener("layoutChange", handleLayoutChange);
  }, []);

  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterUser, setFilterUser] = useState("todos");
  const [completedByFilter, setCompletedByFilter] = useState("todos");
  const [quickFilterType, setQuickFilterType] = useState<string | null>(null);
  const [quickFilterStatus, setQuickFilterStatus] = useState<string | null>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [showInstallmentDialog, setShowInstallmentDialog] = useState(false);
  const [installmentTransaction, setInstallmentTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [showParcelamentoDialog, setShowParcelamentoDialog] = useState(false);
  const [parcelamentoTransaction, setParcelamentoTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [askSignatureModalOpen, setAskSignatureModalOpen] = useState(false);
  const [shouldSignDocument, setShouldSignDocument] = useState(false);
  const [pdfBlobForSign, setPdfBlobForSign] = useState<Blob | null>(null);
  const [signDocType, setSignDocType] = useState<'receipt' | 'service_note'>('receipt');
  const [signDocId, setSignDocId] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [discountTransaction, setDiscountTransaction] = useState<FinancialTransactionWithClient | null>(null);
  const [installmentCount, setInstallmentCount] = useState<number>(1);
  const [installmentValues, setInstallmentValues] = useState<string[]>([]);
  const [installmentDates, setInstallmentDates] = useState<string[]>([]);
  

  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Função para buscar parcelas de uma transação pai
  const getInstallmentsForTransaction = (parentId: number) => {
    return transactions.filter(t => t.parentTransactionId === parentId)
      .sort((a, b: any) => (a.installmentNumber || 0) - (b.installmentNumber || 0));
  };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "saida",
      status: "pago",
      description: "",
      resolution: "",
      amount: "",
      clientId: undefined,
      createdAt: new Date().toISOString().split('T')[0], // Data de hoje como padrão
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      // Se a transação for criada como "paga", usar createdAt como paidAt (data do pagamento efetivo)
      const paymentDate = data.createdAt ? new Date(data.createdAt) : new Date();
      
      const enhancedData = {
        ...data,
        userId: currentUser?.id || 1, // ID do usuário que está criando a transação
        createdByUserId: currentUser?.id || 1, // Rastreamento de quem criou
        // Se a transação for criada como "paga", atribuir completedByUserId e paidAt
        completedByUserId: data.status === "pago" ? (currentUser?.id || 1) : null,
        paidAt: data.status === "pago" ? paymentDate : null,
      };
      const response = await apiRequest("POST", "/api/financial-transactions", enhancedData);
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowTransactionDialog(false);
      setEditingTransaction(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createInstallmentMutation = useMutation({
    mutationFn: async ({ parentId, installmentData }: { parentId: number, installmentData: any }) => {
      const response = await apiRequest("POST", `/api/financial-transactions/${parentId}/installments`, { 
        ...installmentData, 
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1 
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowInstallmentDialog(false);
      setInstallmentTransaction(null);
      toast({
        title: "Sucesso",
        description: "Parcela registrada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao registrar parcela:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar parcela. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const parcelamentoMutation = useMutation({
    mutationFn: async ({ transaction, parcelas }: { transaction: FinancialTransactionWithClient, parcelas: Array<{ valor: number, data: string }> }) => {
      console.log("=== FRONTEND: CRIANDO PARCELAMENTO ===");
      console.log("Transação original:", {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description?.substring(0, 50)
      });
      console.log("Total de parcelas a criar:", parcelas.length);
      
      // Criar TODAS as parcelas iterativamente
      const createdInstallments = [];
      
      for (let i = 0; i < parcelas.length; i++) {
        const parcela = parcelas[i];
        console.log(`Criando parcela ${i + 1}/${parcelas.length}:`, {
          valor: parcela.valor,
          data: parcela.data,
          numero: i + 1,
          totalParcelas: parcelas.length
        });
        
        const response = await apiRequest("POST", `/api/financial-transactions/${transaction.id}/installments`, { 
          installmentNumber: i + 1,
          totalInstallments: parcelas.length,
          amount: parcela.valor,
          currentUserId: loggedUser?.id || 1,
          userId: transaction.userId,
          dueDate: parcela.data
          // NÃO preencher completedByUserId - deixar como pendente!
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Erro ao criar parcela ${i + 1}:`, errorData);
          throw new Error(errorData.message || `Erro ao criar parcela ${i + 1}`);
        }
        
        const installment = await response.json();
        console.log(`Parcela ${i + 1} criada com sucesso:`, {
          id: installment.id,
          status: installment.status,
          amount: installment.amount,
          dueDate: installment.dueDate
        });
        createdInstallments.push(installment);
      }
      
      console.log("=== TODAS AS PARCELAS CRIADAS COM SUCESSO ===");
      return createdInstallments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowParcelamentoDialog(false);
      setParcelamentoTransaction(null);
      toast({
        title: "Sucesso",
        description: "Parcelamento criado com sucesso! Todas as parcelas foram geradas como pendentes.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar parcelamento:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar parcelamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const applyDiscountMutation = useMutation({
    mutationFn: async ({ transactionId, discountAmount }: { transactionId: number, discountAmount: number }) => {
      if (!discountAmount || discountAmount <= 0) {
        throw new Error("Valor de desconto inválido");
      }

      const response = await apiRequest("POST", `/api/financial-transactions/${transactionId}/discount`, { 
        discountAmount, 
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao aplicar desconto" }));
        throw new Error(errorData.message || "Erro ao aplicar desconto");
      }
      
      const result = await response.json();
      
      // Após aplicar desconto, se a transação estava como "pago", marcar como "pendente"
      if (result.transaction?.status === "pago" && discountAmount > 0) {
        await apiRequest("PUT", `/api/financial-transactions/${transactionId}`, { 
          status: "pendente",
          completedByUserId: null,
          paidAt: null,
          userId: loggedUser?.id || 1
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowDiscountDialog(false);
      setDiscountTransaction(null);
      toast({
        title: "Sucesso",
        description: "Desconto aplicado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Error applying discount:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao aplicar desconto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TransactionFormData> }) => {
      const response = await apiRequest("PUT", `/api/financial-transactions/${id}`, {
        ...data,
        createdByUserId: data.createdByUserId || editingTransaction?.createdByUserId || editingTransaction?.userId || loggedUser?.id || 1, // PERMITE MUDANÇA: Usa novo valor do formulário se fornecido
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }
      return response.json();
    },
    onSuccess: (updatedTransaction) => {
      console.log("=== TRANSAÇÃO ATUALIZADA COM SUCESSO ===");
      console.log("Resposta completa da API:", JSON.stringify(updatedTransaction, null, 2));
      console.log("✅ CreatedByUserId na resposta:", updatedTransaction.createdByUserId);
      console.log("✅ UserId na resposta:", updatedTransaction.userId);
      
      // CRÍTICO: Atualizar cache + refetch GARANTIDO
      queryClient.setQueryData(["/api/financial-transactions"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((t: any) => t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t);
      });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.refetchQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      setShowTransactionDialog(false);
      setShowReceiptDialog(false);
      setCompletedTransaction(null);
      setEditingTransaction(null);
      form.reset();
      
      // Verificar se a transação editada pode estar fora do período atual
      const transactionDate = new Date(updatedTransaction.createdAt);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let toastMessage = "Transação atualizada com sucesso!";
      if (transactionDate < thisMonth && periodFilter === "este-mes") {
        toastMessage = "Transação atualizada! Se não aparecer na lista, verifique o filtro de período.";
      }
      
      toast({
        title: "Sucesso",
        description: toastMessage,
      });
    },
    onError: (error) => {
      console.error("=== ERRO NA ATUALIZAÇÃO ===", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    console.log("=== FINANCIAL FORM SUBMIT ===");
    console.log("Form data:", data);
    console.log("Installment Count:", installmentCount);
    console.log("Installment Values:", installmentValues);
    console.log("Installment Dates:", installmentDates);
    
    // Se for parcelado, precisa de quantidade e valores
    if (data.status === "parcelado" && (installmentCount < 2 || installmentValues.length === 0)) {
      toast({
        title: "Erro",
        description: "Por favor, configure as parcelas (quantidade e valores)",
        variant: "destructive",
      });
      return;
    }
    
    // CORRIGIR TIMEZONE: criar data local sem conversão UTC
    let processedDate = undefined;
    if (data.createdAt) {
      if (typeof data.createdAt === 'string') {
        const dateParts = data.createdAt.split('-');
        processedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      } else {
        processedDate = new Date(data.createdAt);
      }
    }
    
    const transactionData = {
      ...data,
      amount: data.amount,
      userId: data.userId || editingTransaction?.userId || currentUser?.id || 1,
      createdByUserId: data.createdByUserId || editingTransaction?.createdByUserId || editingTransaction?.userId || currentUser?.id || 1,
      createdAt: processedDate?.toISOString(),
    };
    
    // Se for parcelado, criar transação pai e depois as parcelas
    if (data.status === "parcelado" && !editingTransaction) {
      try {
        // Criar transação parcelada
        const response = await apiRequest("POST", "/api/financial-transactions", transactionData);
        if (!response.ok) throw new Error("Erro ao criar transação");
        
        const newTransaction = await response.json();
        
        // Criar todas as parcelas com suas respectivas datas
        console.log("=== CRIANDO PARCELAS ===");
        console.log("Total de parcelas a criar:", installmentCount);
        
        for (let i = 0; i < installmentCount; i++) {
          const amount = parseFloat(installmentValues[i] || "0");
          const dueDate = installmentDates[i] || new Date().toISOString().split('T')[0];
          
          console.log(`Parcela ${i + 1}:`, {
            número: i + 1,
            valor: amount,
            data: dueDate,
            dataISO: new Date(dueDate).toISOString()
          });
          
          // Criar a parcela mesmo que o valor seja 0
          const installmentResponse = await apiRequest("POST", `/api/financial-transactions/${newTransaction.id}/installments`, {
            installmentNumber: i + 1,
            totalInstallments: installmentCount,
            amount: amount || 0,
            userId: currentUser?.id || 1,
            dueDate: new Date(dueDate).toISOString(),
          });
          
          if (!installmentResponse.ok) {
            console.error(`Erro ao criar parcela ${i + 1}:`, await installmentResponse.text());
          } else {
            console.log(`✓ Parcela ${i + 1} criada com sucesso`);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        setShowTransactionDialog(false);
        setEditingTransaction(null);
        form.reset();
        setInstallmentCount(1);
        setInstallmentValues([]);
        setInstallmentDates([]);
        
        toast({
          title: "Sucesso",
          description: `Transação parcelada criada com ${installmentCount} parcelas!`,
        });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar transação parcelada",
          variant: "destructive",
        });
      }
    } else if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, data: transactionData });
    } else {
      createTransactionMutation.mutate(transactionData);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    console.log("=== EDITANDO TRANSAÇÃO ===");
    console.log("Transaction data:", transaction);
    console.log("Resolution value:", transaction.resolution);
    
    setEditingTransaction(transaction);
    form.reset({
      description: transaction.description || "",
      resolution: transaction.resolution || "",
      clientId: transaction.clientId || undefined,
      amount: transaction.amount.toString(),
      type: transaction.type,
      status: transaction.status,
      dueDate: transaction.dueDate || undefined,
      createdAt: transaction.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : "",
      userId: transaction.userId || undefined,
      createdByUserId: transaction.createdByUserId || undefined,
    });
    setShowTransactionDialog(true);
  };

  const handleAddInstallment = (transaction: FinancialTransactionWithClient) => {
    setInstallmentTransaction(transaction);
    setShowInstallmentDialog(true);
  };

  const handleApplyDiscount = (transaction: FinancialTransactionWithClient) => {
    setDiscountTransaction(transaction);
    setShowDiscountDialog(true);
  };

  // Função para extrair nome limpo da descrição - SEM TRUNCAMENTO
  const getCleanServiceName = (description: string): string => {
    if (!description) return "Serviço";
    
    // Se a descrição contém dados estruturados, pegar a primeira linha limpa
    const lines = description.split('\n');
    const firstLine = lines[0]?.trim();
    
    // Se a primeira linha é muito curta ou vazia, tentar a próxima
    if (!firstLine || firstLine.length < 3) {
      const nextLine = lines[1]?.trim();
      return nextLine && nextLine.length >= 3 ? nextLine : "Serviço";
    }
    
    // Retornar o nome completo SEM TRUNCAR
    return firstLine;
  };

  // Mutation para enviar transação de volta para serviços - CORRIGIDO
  const sendToServicesMutation = useMutation({
    mutationFn: async (transaction: FinancialTransactionWithClient) => {
      console.log("=== ENVIANDO TRANSAÇÃO PARA SERVIÇOS (PRESERVANDO DADOS) ===");
      console.log("Transaction completa:", transaction);
      console.log("Cliente da transação:", transaction.client);
      console.log("ClientId:", transaction.clientId);
      console.log("Descrição original:", transaction.description);
      
      // Extrair nome limpo e preservar descrição completa
      const serviceName = getCleanServiceName(transaction.description || "");
      console.log("Nome do serviço extraído:", serviceName);
      
      // Reconstituir os dados estruturados dos produtos e serviços
      let reconstructedProducts = null;
      if (transaction.serviceDetails || transaction.productDetails) {
        const allItems = [];
        
        // Adicionar serviços
        if (transaction.serviceDetails) {
          try {
            const services = JSON.parse(transaction.serviceDetails);
            allItems.push(...services.map((service: any) => ({
              ...service,
              type: "servico"
            })));
          } catch (e) {
            console.warn("Erro ao parsear serviceDetails:", e);
          }
        }
        
        // Adicionar produtos
        if (transaction.productDetails) {
          try {
            const products = JSON.parse(transaction.productDetails);
            allItems.push(...products.map((product: any) => ({
              ...product,
              type: "produto"
            })));
          } catch (e) {
            console.warn("Erro ao parsear productDetails:", e);
          }
        }
        
        if (allItems.length > 0) {
          reconstructedProducts = JSON.stringify(allItems);
        }
      }

      // Preservar TODOS os dados da transação original
      const serviceData = {
        name: serviceName,  // Nome limpo extraído
        description: getCleanDescription(transaction.description || ""),  // Descrição limpa sem JSON
        clientId: transaction.clientId,  // Cliente original
        basePrice: transaction.amount.toString(),  // Valor original
        category: "Convertido de Faturamento",  // Marcar origem
        estimatedTime: null,
        products: reconstructedProducts,  // Dados estruturados dos produtos e serviços
        userId: currentUser?.id || 1,  // Usuário atual
        createdByUserId: (transaction as any).createdByUserId || currentUser?.id || 1,  // PRESERVAR CRIADOR ORIGINAL
        serviceDate: new Date().toISOString(),  // Data atual
        createdAt: new Date().toISOString()  // Data de criação
      };
      
      console.log("Dados do serviço a ser criado:", serviceData);
      console.log("ClientId preservado:", serviceData.clientId);
      console.log("Descrição preservada:", serviceData.description);
      console.log("Products estruturados:", serviceData.products);
      console.log("ServiceDetails originais:", transaction.serviceDetails);
      console.log("ProductDetails originais:", transaction.productDetails);
      
      const response = await apiRequest("POST", "/api/services", serviceData);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao criar serviço:", errorText);
        throw new Error(`Failed to create service: ${errorText}`);
      }
      
      const newService = await response.json();
      console.log("Serviço criado com sucesso:", newService);
      console.log("ClientId no novo serviço:", newService.clientId);
      
      // Só deletar após confirmação de criação bem-sucedida
      const deleteResponse = await apiRequest("DELETE", `/api/financial-transactions/${transaction.id}`);
      if (!deleteResponse.ok) {
        console.error("Erro ao deletar transação");
        throw new Error("Failed to delete transaction");
      }
      
      console.log("Transação deletada, conversão completa");
      return newService;
    },
    onSuccess: () => {
      // Limpar todos os states relacionados antes de invalidar queries
      setSelectedTransaction(null);
      setShowTransactionDialog(false);
      setEditingTransaction(null);
      setCompletedTransaction(null);
      setShowReceiptDialog(false);
      setShowInstallmentDialog(false);
      setInstallmentTransaction(null);
      
      // Usar timeout para dar tempo de limpeza dos states
      setTimeout(() => {
        // Invalidar queries para atualizar dados
        queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/services"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      }, 100);
      
      toast({
        title: "Sucesso",
        description: "Transação enviada para serviços com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Error sending to services:", error);
      
      // Limpar states em caso de erro também para evitar estado inconsistente
      setSelectedTransaction(null);
      setShowTransactionDialog(false);
      setEditingTransaction(null);
      
      let errorMessage = "Erro ao enviar para serviços. Tente novamente.";
      if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro na Conversão",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const calculateRemainingAmount = (transaction: FinancialTransactionWithClient) => {
    const totalAmount = parseFloat(transaction.amount.toString());
    // CORREÇÃO: Considerar apenas parcelas PAGAS na dedução
    const paidAmount = transaction.childTransactions
      ?.filter(child => child.status === "pago")
      ?.reduce((sum: number, child: any) => sum + parseFloat(child.amount.toString()), 0) || 0;
    return totalAmount - paidAmount;
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    form.reset();
    setShowTransactionDialog(true);
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/financial-transactions/${id}`, {
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || "Erro ao excluir transação");
      }
      
      // Enviar notificação de exclusão
      const notificationMessage = `🗑️ Transação Excluída\n━━━━━━━━━━━━━━━━\n💳 Transação #${id}\n👨‍💼 Por: ${loggedUser?.name || "Sistema"}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`;
      await apiRequest("POST", "/api/telegram-notification", { message: notificationMessage, type: "financial_deleted" }).catch(() => {});
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao excluir transação:", error);
      let errorMessage = "Erro ao excluir transação. Tente novamente.";
      
      if (error.message && error.message.includes("foreign key")) {
        errorMessage = "Esta transação possui parcelas associadas e não pode ser excluída diretamente. Exclua primeiro as parcelas ou entre em contato com o suporte.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeleteTransaction = (transaction: any) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransactionMutation.mutate(transaction.id);
    }
  };

  const handleComplete = (transaction: FinancialTransactionWithClient) => {
    setCompletedTransaction(transaction);
    setShowReceiptDialog(true);
  };

  const handleParcelamento = (transaction: FinancialTransactionWithClient) => {
    setParcelamentoTransaction(transaction);
    setShowParcelamentoDialog(true);
  };

  const confirmComplete = () => {
    if (!completedTransaction) return;
    
    updateTransactionMutation.mutate({
      id: completedTransaction.id,
      data: {
        status: "pago",
        completedByUserId: loggedUser?.id || 1, // Registrar quem marcou como pago
        paidAt: new Date()
      }
    });
  };

  const generateReceipt = async () => {
    if (!completedTransaction) return;
    
    try {
      console.log("=== GERANDO RECIBO COM GERADOR LIMPO ===");
      console.log("Transação:", {
        id: completedTransaction.id,
        description: completedTransaction.description?.substring(0, 100),
        amount: completedTransaction.amount,
        client: completedTransaction.client?.name
      });
      
      const result = await generateReceiptPDF(completedTransaction, completedTransaction.client);
      if (result) {
        setPdfData(result);
        
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        setPdfBlobForSign(blob);
        setSignDocType('receipt');
        setSignDocId(completedTransaction.id);
        setAskSignatureModalOpen(true);
      }
      
      const notificationMessage = `📄 Recibo Gerado\n━━━━━━━━━━━━━━━━\n💳 Transação #${completedTransaction.id}\n👤 Cliente: ${completedTransaction.client?.name || "Sem cliente"}\n💵 Valor: R$ ${completedTransaction.amount}\n👨‍💼 Por: ${loggedUser?.name || "Sistema"}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`;
      await apiRequest("POST", "/api/telegram-notification", { message: notificationMessage, type: "financial_pdf" }).catch(() => {});
      
      updateTransactionMutation.mutate({
        id: completedTransaction.id,
        data: {
          status: "pago",
          completedByUserId: loggedUser?.id || 1,
          paidAt: new Date()
        }
      });
      
      setShowReceiptDialog(false);
      setCompletedTransaction(null);
    } catch (error: any) {
      console.error("Erro ao gerar recibo:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar recibo: ${error?.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  };

  const handleGenerateServiceNote = async (transaction: FinancialTransactionWithClient) => {
    try {
      console.log("=== GERANDO NOTA DE SERVIÇO ===");
      
      const result = await generateServiceNotePDF(transaction, transaction.client);
      if (result) {
        setPdfData(result);
        
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        setPdfBlobForSign(blob);
        setSignDocType('service_note');
        setSignDocId(transaction.id);
        setAskSignatureModalOpen(true);
      }

      const notificationMessage = `📋 Nota de Serviço Gerada\n━━━━━━━━━━━━━━━━\n💳 Transação #${transaction.id}\n👤 Cliente: ${transaction.client?.name || "Sem cliente"}\n💵 Valor: R$ ${transaction.amount}\n👨‍💼 Por: ${loggedUser?.name || "Sistema"}\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`;
      await apiRequest("POST", "/api/telegram-notification", { message: notificationMessage, type: "financial_pdf" }).catch(() => {});
      
    } catch (error: any) {
      console.error("Erro ao gerar nota de serviço:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar nota de serviço: ${error?.message || "Erro desconhecido"}`,
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

  // Financial reports - Export as PDF
  const exportToPDF = async () => {
    try {
      console.log("=== EXPORTANDO RELATÓRIO FINANCEIRO EM PDF ===");
      
      if (filteredTransactions.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma transação para exportar com os filtros aplicados.",
          variant: "destructive",
        });
        return;
      }

      // Preparar informações de filtro para o PDF
      const selectedClient = clients.find(c => c.id?.toString() === clientFilter);
      const periodLabels: Record<string, string> = {
        "todos": "Todos os períodos",
        "este-mes": "Este mês",
        "ultimo-mes": "Último mês",
        "ultimos-3-meses": "Últimos 3 meses",
        "personalizado": "Período personalizado"
      };
      
      const filters = {
        clientName: selectedClient?.name || undefined,
        clientId: clientFilter && clientFilter !== "todos" ? clientFilter : undefined,
        periodLabel: periodLabels[periodFilter] || periodFilter,
        startDate: periodFilter === "personalizado" && customStartDate 
          ? new Date(customStartDate).toLocaleDateString('pt-BR') 
          : undefined,
        endDate: periodFilter === "personalizado" && customEndDate 
          ? new Date(customEndDate).toLocaleDateString('pt-BR') 
          : undefined,
      };

      // Generate PDF and open viewer
      const result = await generateFinancialReportPDF(filteredTransactions, filters);
      if (result) {
        setPdfData(result);
        setPdfViewerOpen(true);
      }

      toast({
        title: "Sucesso",
        description: "Relatório financeiro gerado com sucesso!",
      });
      
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar relatório: ${error?.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  };

  // Função para obter datas do período selecionado
  const getPeriodDates = () => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    switch (periodFilter) {
      case "todos":
        return { 
          startDate: new Date(2020, 0, 1), 
          endDate: new Date(2030, 11, 31) 
        };
      case "este-mes":
        return { startDate: startOfThisMonth, endDate: now };
      case "ultimo-mes":
        return { startDate: startOfLastMonth, endDate: endOfLastMonth };
      case "ultimos-3-meses":
        return { startDate: startOf3MonthsAgo, endDate: now };
      case "personalizado":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate + 'T00:00:00.000'); // Force local timezone
          const end = new Date(customEndDate + 'T23:59:59.999'); // Force local timezone and include full end date
          return { startDate: start, endDate: end };
        }
        return { startDate: new Date(0), endDate: now }; // Show all if no custom dates
      default:
        return { 
          startDate: new Date(2020, 0, 1), 
          endDate: new Date(2030, 11, 31) 
        };
    }
  };

  // Calculate financial stats based on applied filters
  const stats = useMemo(() => {
    const { startDate, endDate } = getPeriodDates();
    
    let filteredForStats = transactions;

    // Apply period filter - INTELIGENTE: usar dueDate para parcelas, paidAt para pagas, createdAt para pendentes
    filteredForStats = filteredForStats.filter(transaction => {
      let transactionDate;
      if (transaction.installmentNumber) {
        // Para PARCELAS, usar data de vencimento
        transactionDate = transaction.dueDate ? new Date(transaction.dueDate) : new Date(transaction.createdAt);
      } else if (transaction.status === "pago" && transaction.paidAt) {
        // Para transações PAGAS, usar data de pagamento
        transactionDate = new Date(transaction.paidAt);
      } else {
        // Para transações PENDENTES, usar data de criação
        transactionDate = new Date(transaction.createdAt);
      }
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Apply type filter - usar quickFilterType se ativo, senão usar typeFilter
    const effectiveTypeFilter = quickFilterType || typeFilter;
    if (effectiveTypeFilter && effectiveTypeFilter !== "" && effectiveTypeFilter !== "todos") {
      filteredForStats = filteredForStats.filter(t => t.type === effectiveTypeFilter);
    }

    // Apply status filter - usar quickFilterStatus se ativo
    if (quickFilterStatus) {
      filteredForStats = filteredForStats.filter(t => {
        if (quickFilterStatus === "pago") {
          return t.status === "pago";
        } else if (quickFilterStatus === "pendente") {
          return t.status === "pendente" || t.status === "parcial";
        }
        return true;
      });
    }

    // Apply client filter
    if (clientFilter && clientFilter !== "" && clientFilter !== "todos") {
      filteredForStats = filteredForStats.filter(t => t.clientId && clientFilter === t.clientId.toString());
    }

    // Calculate income (entradas pagas)
    const income = filteredForStats
      .filter(t => t.type === "entrada" && t.status === "pago")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Calculate expenses (saídas pagas)
    const expenses = filteredForStats
      .filter(t => t.type === "saida" && t.status === "pago")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Calculate pending receivables (entradas pendentes ou parciais)
    const pending = filteredForStats
      .filter(t => t.type === "entrada" && (t.status === "pendente" || t.status === "parcial"))
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return { income, expenses, pending };
  }, [transactions, periodFilter, customStartDate, customEndDate, typeFilter, clientFilter]);

  const filteredTransactions = useMemo(() => {
    console.log("=== FILTRANDO TRANSAÇÕES FINANCEIRAS ===");
    console.log("Total de transações:", transactions.length);
    console.log("Filtros aplicados:", { periodFilter, customStartDate, customEndDate, typeFilter, clientFilter, statusFilter, filterUser, completedByFilter });
    
    if (!Array.isArray(transactions)) {
      console.warn("Transações não é um array:", transactions);
      return [];
    }

    const { startDate, endDate } = getPeriodDates();
    console.log("Período filtrado:", { 
      startDate: startDate.toLocaleDateString('pt-BR'), 
      endDate: endDate.toLocaleDateString('pt-BR'),
      startDateISO: startDate.toISOString(),
      endDateISO: endDate.toISOString()
    });

    return transactions.filter((transaction, index: number) => {
      try {
        if (!transaction || typeof transaction !== 'object') {
          console.warn(`Transação ${index} inválida:`, transaction);
          return false;
        }

        // Period filter - INTELIGENTE: usar dueDate para parcelas, paidAt para pagas, createdAt para pendentes
        let transactionDate;
        if (transaction.installmentNumber) {
          // Para PARCELAS, usar data de vencimento
          transactionDate = transaction.dueDate ? new Date(transaction.dueDate) : new Date(transaction.createdAt);
        } else if (transaction.status === "pago" && transaction.paidAt) {
          // Para transações PAGAS, usar data de pagamento
          transactionDate = new Date(transaction.paidAt);
        } else {
          // Para transações PENDENTES, usar data de criação
          transactionDate = new Date(transaction.createdAt);
        }
        const matchesPeriod = transactionDate >= startDate && transactionDate <= endDate;

        // Type filter - usar quickFilterType se ativo
        const effectiveTypeFilter = quickFilterType || typeFilter;
        const matchesType = !effectiveTypeFilter || effectiveTypeFilter === "" || effectiveTypeFilter === "todos" ||
          (effectiveTypeFilter === "entrada" && transaction.type === "entrada") ||
          (effectiveTypeFilter === "saida" && transaction.type === "saida");

        // Status filter - usar quickFilterStatus se ativo
        let matchesQuickStatus = true;
        if (quickFilterStatus) {
          if (quickFilterStatus === "pago") {
            matchesQuickStatus = transaction.status === "pago";
          } else if (quickFilterStatus === "pendente") {
            matchesQuickStatus = transaction.status === "pendente" || transaction.status === "parcial";
          }
        }

        // Client filter - usa ID do cliente selecionado no ClientFilter
        const matchesClient = !clientFilter || clientFilter === "" || clientFilter === "todos" ||
          (transaction.clientId && clientFilter === transaction.clientId.toString());

        // Status filter
        const matchesStatus = !statusFilter || statusFilter === "" || statusFilter === "todos" ||
          transaction.status === statusFilter;

        // User filter
        const matchesUser = !filterUser || filterUser === "todos" || 
          (transaction.userId && String(transaction.userId) === filterUser) ||
          (transaction.completedByUserId && String(transaction.completedByUserId) === filterUser);

        // Completed by filter
        const matchesCompletedBy = !completedByFilter || completedByFilter === "todos" || 
          (completedByFilter === "sem-usuario" ? !transaction.completedByUserId : 
           transaction.completedByUserId && String(transaction.completedByUserId) === completedByFilter);

        const result = matchesPeriod && matchesType && matchesClient && matchesStatus && matchesUser && matchesCompletedBy && matchesQuickStatus;
        
        // LOGGING DETALHADO PARA DEBUG - TRANSAÇÃO 105 EMPÓRIO E PARCELAS
        if (transaction.id === 105 || transaction.id === 131 || transaction.id === 132 || transaction.id === 133 || index < 3) {
          console.log(`=== FILTRO TRANSAÇÃO ${transaction.id} (index ${index}) ===`);
          console.log("Data da transação:", transactionDate);
          console.log("Período filtro:", { startDate, endDate });
          console.log("Filtros ativos:", { periodFilter, typeFilter, clientFilter, statusFilter, filterUser, completedByFilter });
          console.log("Resultados do filtro:", {
            id: transaction.id,
            date: transactionDate.toLocaleDateString('pt-BR'),
            type: transaction.type,
            client: transaction.client?.name,
            status: transaction.status,
            userId: transaction.userId,
            completedByUserId: transaction.completedByUserId,
            matches: { matchesPeriod, matchesType, matchesClient, matchesStatus, matchesUser, matchesCompletedBy, result },
            createdAt: transaction.createdAt,
            description: transaction.description?.substring(0, 50)
          });
        }
        
        return result;
      } catch (error) {
        console.error(`ERRO CRÍTICO ao filtrar transação ${index}:`, error, transaction);
        return false; // Em caso de erro, não inclui a transação
      }
    });
  }, [transactions, periodFilter, customStartDate, customEndDate, typeFilter, clientFilter, statusFilter, filterUser, completedByFilter, users, quickFilterType, quickFilterStatus]);

  return (
    <div 
      className="min-h-screen bg-gray-900 p-6 space-y-6"
      onClick={(e) => {
        // Se clicar no container vazio (não em botões/cards), deselecionar filtros
        if (e.target === e.currentTarget) {
          setQuickFilterType(null);
          setQuickFilterStatus(null);
        }
      }}
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-green-400 mb-2">Faturamento</h2>
          <p className="text-gray-400">Controle de entradas, saídas e pendências financeiras</p>
        </div>
        <Button onClick={handleAddTransaction} className="bg-purple-600 hover:bg-purple-700 border-4 border-purple-500 dark:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 dark:shadow-purple-500/20 shadow-lg w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Financial Stats - Interactive Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <button onClick={() => {
          setQuickFilterType(quickFilterType === "entrada" && quickFilterStatus === "pago" ? null : "entrada");
          setQuickFilterStatus(quickFilterType === "entrada" && quickFilterStatus === "pago" ? null : "pago");
        }} className="transition-all hover:-translate-y-1">
          <Card className={`bg-white dark:bg-slate-800 border-4 border-green-600 dark:border-green-500 hover:shadow-lg hover:shadow-green-600/50 shadow-lg dark:shadow-green-600/20 transition-all cursor-pointer h-28 ${quickFilterType === "entrada" && quickFilterStatus === "pago" ? 'ring-4 ring-green-400 scale-105' : ''}`}>
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Recebido</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 text-center break-words">{formatCurrency(stats.income)}</p>
              {quickFilterType === "entrada" && quickFilterStatus === "pago" && <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">✓ Filtrado</p>}
            </CardContent>
          </Card>
        </button>

        <button onClick={() => {
          setQuickFilterType(quickFilterType === "saida" ? null : "saida");
          setQuickFilterStatus(null);
        }} className="transition-all hover:-translate-y-1">
          <Card className={`bg-white dark:bg-slate-800 border-4 border-red-600 dark:border-red-500 hover:shadow-lg hover:shadow-red-600/50 shadow-lg dark:shadow-red-600/20 transition-all cursor-pointer h-28 ${quickFilterType === "saida" ? 'ring-4 ring-red-400 scale-105' : ''}`}>
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Saídas</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 text-center break-words">{formatCurrency(stats.expenses)}</p>
              {quickFilterType === "saida" && <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">✓ Filtrado</p>}
            </CardContent>
          </Card>
        </button>

        <button onClick={() => {
          setQuickFilterType(quickFilterType === "entrada" && quickFilterStatus === "pendente" ? null : "entrada");
          setQuickFilterStatus(quickFilterType === "entrada" && quickFilterStatus === "pendente" ? null : "pendente");
        }} className="transition-all hover:-translate-y-1">
          <Card className={`bg-white dark:bg-slate-800 border-4 border-yellow-500 dark:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50 shadow-lg dark:shadow-yellow-500/20 transition-all cursor-pointer h-28 ${quickFilterType === "entrada" && quickFilterStatus === "pendente" ? 'ring-4 ring-yellow-300 scale-105' : ''}`}>
            <CardContent className="h-full flex flex-col items-center justify-center p-3">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Pendente</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 text-center break-words">{formatCurrency(stats.pending)}</p>
              {quickFilterType === "entrada" && quickFilterStatus === "pendente" && <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mt-1">✓ Filtrado</p>}
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Filters - Mobile Optimized with Collapsible */}
      <Card className="mb-6 bg-white dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowFiltersPanel(!showFiltersPanel)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Filtros
              <span className={`text-sm transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`}>⬇️</span>
            </CardTitle>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              Personalizar Busca
            </span>
          </div>
        </CardHeader>
        {showFiltersPanel && (
        <CardContent className="space-y-4">
          {/* Primary Filters Row - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Período */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Período
              </label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Períodos</SelectItem>
                  <SelectItem value="este-mes">Este Mês</SelectItem>
                  <SelectItem value="ultimo-mes">Último Mês</SelectItem>
                  <SelectItem value="ultimos-3-meses">Últimos 3 Meses</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Tipo
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Cliente
              </label>
              <ClientFilter
                value={clientFilter}
                onChange={setClientFilter}
                placeholder="Buscar..."
              />
            </div>
          </div>

          {/* Custom Date Range - Shown when Personalizado selected */}
          {periodFilter === "personalizado" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Data Final
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters - Collapsible on mobile */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors w-full lg:hidden"
            >
              <span>{showAdvancedFilters ? '▼' : '▶'}</span>
              Filtros Avançados
            </button>
            
            <div className={`${showAdvancedFilters ? 'block' : 'hidden'} lg:block lg:border-0 lg:pt-0 lg:mt-0`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-4 lg:mt-0">
                {/* Usuário */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Criado por
                  </label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Marcado como pago por */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Marcado como pago por
                  </label>
                  <Select value={completedByFilter} onValueChange={setCompletedByFilter}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="sem-usuario">Sem usuário</SelectItem>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setPeriodFilter("este-mes");
                setCustomStartDate("");
                setCustomEndDate("");
                setTypeFilter("");
                setClientFilter("");
                setStatusFilter("");
                setFilterUser("todos");
                setCompletedByFilter("todos");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Header com Botão e Título */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Movimentações Financeiras</h2>
        <div className="flex gap-2">
          <Button 
            onClick={exportToPDF}
            className="bg-emerald-600 hover:bg-emerald-700 border-4 border-emerald-500 dark:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/50 dark:shadow-emerald-500/20 shadow-lg text-white flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatório PDF
          </Button>
        </div>
      </div>

      {/* Financial Transactions - Grid de Cards Compactos */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando movimentações...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 font-semibold">Nenhuma movimentação encontrada</p>
            <p className="text-gray-500 dark:text-gray-400">
              {transactions.length === 0 
                ? "As movimentações aparecerão aqui conforme os serviços forem registrados."
                : "Tente ajustar os filtros para encontrar o que procura."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {filteredTransactions
            .sort((a, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((transaction) => (
            <Card key={transaction.id} className={`bg-white dark:bg-slate-800 border-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group relative flex flex-col h-full shadow-lg ${
              transaction.type === "entrada" && transaction.status === "pago" ? "border-green-500 dark:border-green-400 hover:shadow-green-500/50 dark:shadow-green-500/20" : (transaction.type === "entrada" && (transaction.status === "pendente" || transaction.status === "parcial") ? "border-yellow-400 dark:border-yellow-300 hover:shadow-yellow-400/50 dark:shadow-yellow-400/20" : "border-red-500 dark:border-red-400 hover:shadow-red-500/50 dark:shadow-red-500/20")
            }`}>
              <CardContent className="p-0 flex flex-col flex-1 relative">
                {/* Badge de status no canto superior esquerdo */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="outline" className={`${getStatusColor(transaction.status)} text-xs h-5 px-2 border font-semibold`}>
                    {getStatusLabel(transaction.status, transaction)}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3 flex-1">
                  {/* Linha 1: Cliente label e Criado Por com mais espaço */}
                  <div className="flex items-start justify-between gap-2 mb-1 mt-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-shrink-0">Cliente</p>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Criado Por</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate text-xs text-right">{users?.find(u => u.id === ((transaction as any).createdByUserId ?? transaction.userId))?.name || "Sistema"}</p>
                    </div>
                  </div>
                  
                  {/* Linha 2: Nome do cliente e data */}
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm break-words flex-1">
                      {transaction.client?.name || "Sem cliente"}
                    </p>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(transaction.installmentNumber && transaction.dueDate ? transaction.dueDate : transaction.createdAt).split(" ")[0]}
                    </span>
                  </div>

                  {/* Descrição - com mais espaço disponível */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {getCleanDescription(transaction.description || "Sem descrição")}
                    </p>
                  </div>

                  {/* Valor em destaque */}
                  <div className="pt-1 mb-2">
                    <span className={`font-bold text-lg ${
                      transaction.type === "entrada" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "entrada" ? "+" : "-"}
                      {formatCurrency(parseFloat(transaction.amount.toString()))}
                    </span>
                  </div>

                  {/* Resumo de parcelas - se existirem */}
                  {transaction.childTransactions && transaction.childTransactions.length > 0 && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-2 space-y-1">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Total:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(parseFloat(transaction.amount.toString()))}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-700 dark:text-green-400">
                        <span>Recebido:</span>
                        <span className="font-semibold">
                          {formatCurrency(transaction.childTransactions
                            .filter(c => c.status === "pago")
                            .reduce((sum: number, c: any) => sum + parseFloat(c.amount.toString()), 0))}
                        </span>
                      </div>
                      <div className="flex justify-between text-orange-700 dark:text-orange-400">
                        <span>Pendente:</span>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(transaction.amount.toString()) - transaction.childTransactions
                            .filter(c => c.status === "pago")
                            .reduce((sum: number, c: any) => sum + parseFloat(c.amount.toString()), 0))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quem marcou como recebido - se existir */}
                  {transaction.completedByUserId && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                        ✓ Recebido por: <span className="text-gray-700 dark:text-gray-300">{users.find(u => u.id === transaction.completedByUserId)?.username || `Usuário ${transaction.completedByUserId}`}</span>
                      </p>
                    </div>
                  )}

                </div>

                {/* Ações - grid compacto na parte inferior - SEMPRE NO BOTTOM */}
                <div className="p-4 pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
                    {/* Primeira linha - 5 botões */}
                    <div className="grid grid-cols-5 gap-1">
                      {/* Botão de + para Adicionar Recebimento Avulso */}
                      {(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddInstallment(transaction);
                          }}
                          className="h-8 text-xs text-blue-400 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col items-center justify-center p-1"
                          title="Registrar Recebimento Avulso"
                          data-testid={`button-add-payment-${transaction.id}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <div></div>
                      )}

                      {/* Botão Marcar como Pago */}
                      {(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(transaction);
                          }}
                          className="h-8 text-xs text-green-400 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex flex-col items-center justify-center p-1"
                          title="Marcar como Pago"
                          data-testid={`button-complete-${transaction.id}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <div></div>
                      )}

                      {/* Botão Converter para Serviço - APENAS PARA ENTRADAS */}
                      {transaction.type === "entrada" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendToServicesMutation.mutate(transaction);
                          }}
                          className="h-8 text-xs text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex flex-col items-center justify-center p-1"
                          title="Converter em Serviço"
                          data-testid={`button-convert-service-${transaction.id}`}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {transaction.type !== "entrada" && (
                        <div></div>
                      )}

                      {/* PDF Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateServiceNote(transaction);
                        }}
                        className="h-8 text-xs text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 flex flex-col items-center justify-center p-1"
                        title="Gerar PDF"
                        data-testid={`button-pdf-${transaction.id}`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTransaction(transaction);
                        }}
                        className="h-8 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/20 flex flex-col items-center justify-center p-1"
                        title="Editar"
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Segunda linha - 5 botões */}
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      {/* Botão Parcelar */}
                      {(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleParcelamento(transaction);
                          }}
                          className="h-8 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex flex-col items-center justify-center p-1"
                          title="Parcelar"
                          data-testid={`button-parcelamento-${transaction.id}`}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <div></div>
                      )}

                      {/* Botão Desconto */}
                      {(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiscountTransaction(transaction);
                            setShowDiscountDialog(true);
                          }}
                          className="h-8 text-xs text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex flex-col items-center justify-center p-1"
                          title="Desconto"
                          data-testid={`button-discount-${transaction.id}`}
                        >
                          <Percent className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!(transaction.status === "pendente" || transaction.status === "parcial") && (
                        <div></div>
                      )}

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(transaction);
                        }}
                        className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col items-center justify-center p-1"
                        title="Deletar"
                        data-testid={`button-delete-${transaction.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      {/* Eye Button - Ver Detalhes */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                        }}
                        className="h-8 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/20 flex flex-col items-center justify-center p-1"
                        title="Ver Detalhes"
                        data-testid={`button-view-details-${transaction.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Spacer para completar a linha */}
                      <div></div>
                    </div>
                </div>
              </CardContent>
            </Card>
            ))}
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-bold">Concluir Transação</DialogTitle>
            <DialogDescription className="text-base">
              Escolha como deseja finalizar esta transação
            </DialogDescription>
          </DialogHeader>
          
          {completedTransaction && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Transaction Summary Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {completedTransaction.client?.name || 'Não informado'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(parseFloat(completedTransaction.amount.toString()))}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Descrição:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm leading-relaxed">
                      {getCleanDescription(completedTransaction.description || "")}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={generateReceipt}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base flex items-center justify-center gap-2"
                >
                  <Receipt className="h-5 w-5" />
                  Gerar Recibo e Concluir
                </Button>
                
                <Button
                  variant="outline"
                  onClick={confirmComplete}
                  className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  Concluir sem Recibo
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowReceiptDialog(false);
                    setCompletedTransaction(null);
                  }}
                  className="w-full h-10 text-base text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Parcelamento Dialog */}
      <ParcelamentoDialog 
        open={showParcelamentoDialog}
        onOpenChange={setShowParcelamentoDialog}
        transaction={parcelamentoTransaction}
        onSubmit={(parcelas) => {
          if (parcelamentoTransaction) {
            parcelamentoMutation.mutate({ transaction: parcelamentoTransaction, parcelas });
          }
        }}
        isLoading={parcelamentoMutation.isPending}
      />

      {/* Dialog para Nova Transação */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="w-[95vw] max-w-2xl flex flex-col mx-auto max-h-[90vh] overflow-hidden bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingTransaction ? "Editar Transação" : "Nova Transação Financeira"}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Registre uma nova entrada ou saída financeira no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
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
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="parcelado">Parcelado</SelectItem>
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
                      <Textarea {...field} rows={3} placeholder="Descreva a transação..." />
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
                name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Transação</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date" 
                        placeholder="Data da transação..."
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

              {/* Campos de Parcelamento - Mostrar apenas quando "parcelado" for selecionado */}
              {form.watch("status") === "parcelado" && (
                <>
                  <FormItem>
                    <FormLabel>Quantidade de Parcelas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="2" 
                        max="60"
                        value={installmentCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 1;
                          setInstallmentCount(count);
                          const amount = parseFloat(form.watch("amount")) || 0;
                          const baseValue = (amount / count).toFixed(2);
                          setInstallmentValues(Array(count).fill(baseValue));
                          
                          // Gerar datas incrementando 1 mês cada
                          const startDate = new Date(form.watch("createdAt") || new Date());
                          const dates = Array.from({ length: count }).map((_, idx) => {
                            const date = new Date(startDate);
                            date.setMonth(date.getMonth() + idx);
                            return date.toISOString().split('T')[0];
                          });
                          setInstallmentDates(dates);
                        }}
                        placeholder="Ex: 3"
                      />
                    </FormControl>
                  </FormItem>

                  {installmentCount > 0 && installmentValues.length > 0 && (
                    <>
                      <FormItem>
                        <FormLabel>Valor e Data de Cada Parcela</FormLabel>
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                          {Array.from({ length: installmentCount }).map((_, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-8">#{idx + 1}</span>
                              <Input 
                                type="number" 
                                step="0.01"
                                value={installmentValues[idx] || ""}
                                onChange={(e) => {
                                  const newValues = [...installmentValues];
                                  newValues[idx] = e.target.value;
                                  setInstallmentValues(newValues);
                                }}
                                placeholder="Valor"
                                className="h-8 text-xs flex-1"
                              />
                              <Input 
                                type="date"
                                value={installmentDates[idx] || ""}
                                onChange={(e) => {
                                  const newDates = [...installmentDates];
                                  newDates[idx] = e.target.value;
                                  setInstallmentDates(newDates);
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    </>
                  )}
                </>
              )}

                  </div>
                
                  {/* Botões fixos no final */}
                  <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTransactionDialog(false);
                        setEditingTransaction(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}
                    >
                      {(createTransactionMutation.isPending || updateTransactionMutation.isPending) 
                        ? "Salvando..." 
                        : editingTransaction ? "Atualizar" : "Salvar Transação"
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
        </DialogContent>
      </Dialog>

      {/* View Transaction Modal - NEW MODAL */}
      <TransactionDetailsModal 
        isOpen={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
        transaction={selectedTransaction} 
      />

      {/* Installment Dialog */}
      <Dialog open={showInstallmentDialog} onOpenChange={setShowInstallmentDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-bold">Registrar Parcela</DialogTitle>
            <DialogDescription className="text-base">
              Registre um pagamento parcial para esta transação
            </DialogDescription>
          </DialogHeader>
          
          {installmentTransaction && (
            <InstallmentForm 
              transaction={installmentTransaction}
              currentUser={currentUser}
              onSubmit={(data) => createInstallmentMutation.mutate({ 
                parentId: installmentTransaction.id, 
                installmentData: { ...data, status: "pago", completedByUserId: currentUser?.id || 1 }
              })}
              onCancel={() => {
                setShowInstallmentDialog(false);
                setInstallmentTransaction(null);
              }}
              isLoading={createInstallmentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-bold">Aplicar Desconto</DialogTitle>
            <DialogDescription className="text-base">
              Digite o valor do desconto a ser aplicado nesta entrada
            </DialogDescription>
          </DialogHeader>
          
          {discountTransaction && (
            <DiscountForm 
              transaction={discountTransaction}
              onSubmit={(discountAmount) => applyDiscountMutation.mutate({ 
                transactionId: discountTransaction.id, 
                discountAmount
              })}
              onCancel={() => {
                setShowDiscountDialog(false);
                setDiscountTransaction(null);
              }}
              isLoading={applyDiscountMutation.isPending}
            />
          )}
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
              Deseja assinar digitalmente este documento antes de compartilhar ou visualizar?
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
        documentType={signDocType}
        documentId={signDocId}
        documentName={pdfData?.filename?.replace('.pdf', '') || `documento_${signDocId}`}
        userId={loggedUser?.id}
        onDownloadOriginal={() => {
          if (pdfData) {
            const a = document.createElement('a');
            a.href = pdfData.dataUrl;
            a.download = pdfData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast({ title: "PDF Baixado", description: "Documento baixado com sucesso!" });
          }
        }}
        onSignSuccess={(signedPdfBase64) => {
          // Converter PDF assinado base64 para dataUrl
          const dataUrl = `data:application/pdf;base64,${signedPdfBase64}`;
          setPdfData({
            dataUrl,
            filename: pdfData?.filename || `documento_${signDocId}.pdf`
          });
        }}
      />
    </div>
  );
}

// Componente para modal de parcelamento
function ParcelamentoDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: FinancialTransactionWithClient | null;
  onSubmit: (parcelas: Array<{ valor: number, data: string }>) => void;
  isLoading: boolean;
}) {
  const [numeroParcelas, setNumeroParcelas] = useState(2);
  const [divisaoTipo, setDivisaoTipo] = useState<'igual' | 'custom'>('igual');
  const [parcelas, setParcelas] = useState<Array<{ valor: number, data: string }>>([]);
  const [dataInicial, setDataInicial] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const valorTotal = transaction ? parseFloat(transaction.amount.toString()) : 0;

  // Resetar quando abrir o modal
  useEffect(() => {
    if (open && transaction) {
      setNumeroParcelas(2);
      setDivisaoTipo('igual');
      const today = new Date();
      setDataInicial(today.toISOString().split('T')[0]);
      
      // Criar parcelas iguais por padrão
      const valorParcela = valorTotal / 2;
      const newParcelas = [];
      for (let i = 0; i < 2; i++) {
        const data = new Date(today);
        data.setMonth(data.getMonth() + i);
        newParcelas.push({
          valor: valorParcela,
          data: data.toISOString().split('T')[0]
        });
      }
      setParcelas(newParcelas);
    }
  }, [open, transaction, valorTotal]);

  // Recalcular parcelas APENAS quando número de parcelas muda em modo 'igual'
  useEffect(() => {
    if (divisaoTipo === 'igual' && parcelas.length > 0) {
      // Apenas recalcular se o número de parcelas mudou
      if (parcelas.length !== numeroParcelas) {
        const valorParcela = valorTotal / numeroParcelas;
        const newParcelas = [];
        const startDate = new Date(dataInicial);
        
        for (let i = 0; i < numeroParcelas; i++) {
          const data = new Date(startDate);
          data.setMonth(data.getMonth() + i);
          newParcelas.push({
            valor: valorParcela,
            data: data.toISOString().split('T')[0]
          });
        }
        setParcelas(newParcelas);
      }
    }
  }, [numeroParcelas, divisaoTipo]);

  const updateParcela = (index: number, field: 'valor' | 'data', value: string | number) => {
    const newParcelas = [...parcelas];
    if (field === 'valor') {
      newParcelas[index].valor = parseFloat(value.toString()) || 0;
    } else {
      newParcelas[index].data = value.toString();
    }
    setParcelas(newParcelas);
  };

  const totalParcelas = parcelas.reduce((sum, p) => sum + p.valor, 0);
  const diferenca = valorTotal - totalParcelas;

  const handleSubmit = () => {
    if (Math.abs(diferenca) > 0.01) {
      alert('O total das parcelas deve ser igual ao valor da transação');
      return;
    }
    onSubmit(parcelas);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl bg-slate-900 border-2 border-green-500 shadow-2xl shadow-green-500/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Parcelar Entrada</DialogTitle>
          <DialogDescription>
            Divida esta entrada em parcelas personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da transação */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {transaction.client?.name || 'Cliente não informado'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {getCleanDescription(transaction.description || "")}
            </p>
            <p className="text-lg font-bold text-blue-600">
              Total: {formatCurrency(valorTotal)}
            </p>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Número de Parcelas</label>
              <Input
                type="number"
                min="2"
                max="12"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(parseInt(e.target.value) || 2)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data da Primeira Parcela</label>
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Tipo de divisão */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Divisão</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="igual"
                  checked={divisaoTipo === 'igual'}
                  onChange={(e) => setDivisaoTipo(e.target.value as 'igual' | 'custom')}
                />
                Valores Iguais
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="custom"
                  checked={divisaoTipo === 'custom'}
                  onChange={(e) => setDivisaoTipo(e.target.value as 'igual' | 'custom')}
                />
                Valores Personalizados
              </label>
            </div>
          </div>

          {/* Lista de parcelas */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Parcelas</h4>
            {parcelas.map((parcela, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Parcela {index + 1} - Valor
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={parcela.valor}
                    onChange={(e) => updateParcela(index, 'valor', e.target.value)}
                    disabled={divisaoTipo === 'igual'}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Data de Vencimento
                  </label>
                  <Input
                    type="date"
                    value={parcela.data}
                    onChange={(e) => updateParcela(index, 'data', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Resumo final */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total das Parcelas:</span>
              <span className={`font-bold ${Math.abs(diferenca) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalParcelas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor Original:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(valorTotal)}
              </span>
            </div>
            {Math.abs(diferenca) >= 0.01 && (
              <div className="flex justify-between items-center mt-2 text-red-600">
                <span className="font-medium">Diferença:</span>
                <span className="font-bold">
                  {formatCurrency(diferenca)}
                </span>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Math.abs(diferenca) >= 0.01}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Criando Parcelamento..." : "Criar Parcelamento"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Discount Form Component
function DiscountForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  transaction: FinancialTransactionWithClient;
  onSubmit: (discountAmount: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [discountAmount, setDiscountAmount] = useState("");
  
  const currentAmount = parseFloat(transaction.amount.toString());
  const maxDiscount = currentAmount * 0.9; // Máximo 90% de desconto

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const discount = parseFloat(discountAmount);
    if (discount <= 0 || discount >= currentAmount) {
      return;
    }

    onSubmit(discount);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border-l-4 border-green-500">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{getCleanDescription(transaction.description || "")}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor atual:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(currentAmount)}</span>
          </div>
          {discountAmount && parseFloat(discountAmount) > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Desconto:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(parseFloat(discountAmount))}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">Novo valor:</span>
                <span className="font-bold text-lg text-green-600">{formatCurrency(currentAmount - parseFloat(discountAmount))}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Discount Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-base font-medium text-gray-900 dark:text-white">
            Valor do desconto
          </label>
          <Input
            type="number"
            step="0.01"
            max={maxDiscount}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            placeholder="0,00"
            className="h-12 text-lg"
            required
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Desconto máximo permitido: <span className="font-medium text-orange-600">{formatCurrency(maxDiscount)}</span>
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading || !discountAmount || parseFloat(discountAmount) <= 0 || parseFloat(discountAmount) >= currentAmount}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
          >
            {isLoading ? "Aplicando..." : `Aplicar Desconto de ${discountAmount ? formatCurrency(parseFloat(discountAmount)) : "R$ 0,00"}`}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel} 
            className="w-full h-10 text-base text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

// Installment Form Component
function InstallmentForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  isLoading,
  currentUser 
}: { 
  transaction: FinancialTransactionWithClient;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  currentUser?: any;
}) {
  const [amount, setAmount] = useState("");
  
  const totalAmount = parseFloat(transaction.amount.toString());
  const paidAmount = transaction.childTransactions?.reduce((sum: number, child: any) => 
    sum + parseFloat(child.amount.toString()), 0
  ) || 0;
  const remainingAmount = totalAmount - paidAmount;
  const nextInstallmentNumber = (transaction.childTransactions?.length || 0) + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const installmentAmount = parseFloat(amount);
    if (installmentAmount <= 0 || installmentAmount > remainingAmount) {
      return;
    }

    onSubmit({
      amount: installmentAmount,
      installmentNumber: nextInstallmentNumber,
      // NÃO definir totalInstallments para pagamentos avulsos - será null
      userId: currentUser?.id || 1
    });
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{getCleanDescription(transaction.description || "")}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor total:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Já pago:</span>
            <span className="font-semibold text-green-600">{formatCurrency(paidAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">Valor restante:</span>
            <span className="font-bold text-lg text-red-600">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Previous Installments */}
      {transaction.childTransactions && transaction.childTransactions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Parcelas já recebidas ({transaction.childTransactions.filter(child => child.status === "pago").length} de {transaction.childTransactions.length}):</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {transaction.childTransactions
              .filter(installment => installment.status === "pago")
              .map((installment: any, index: number) => (
              <div key={installment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium">Parcela {installment.installmentNumber || index + 1}</span>
                <span className="font-semibold text-green-600">{formatCurrency(parseFloat(installment.amount.toString()))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Installment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label className="block text-base font-medium text-gray-900 dark:text-white">
            Valor desta parcela
          </label>
          <Input
            type="number"
            step="0.01"
            max={remainingAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="h-12 text-lg"
            required
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Valor máximo disponível: <span className="font-medium text-orange-600">{formatCurrency(remainingAmount)}</span>
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
          >
            {isLoading ? "Registrando..." : `Registrar Parcela de ${amount ? formatCurrency(parseFloat(amount)) : "R$ 0,00"}`}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel} 
            className="w-full h-10 text-base text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
