import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type QuoteWithClient, type Client } from "@shared/schema";
import { Plus, FileText, Edit, Trash2, DollarSign, ArrowRight, Download, Eye, Calendar, Clock, User } from "lucide-react";
import { ClientSearch } from "@/components/ClientSearch";
import { ClientFilter } from "@/components/ClientFilter";
import { Badge } from "@/components/ui/badge";
import { generateQuotePDF } from "@/utils/professionalPdfGenerator";
import { PDFViewer } from "@/components/PDFViewer";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { SignatureModal } from "@/components/SignatureModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const quoteFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  clientId: z.coerce.number().min(1, "Cliente é obrigatório"),
  items: z.array(z.object({
    type: z.string().default("servico"),
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z.string().min(1, "Valor é obrigatório"),
    quantity: z.coerce.number().min(1, "Quantidade deve ser maior que 0").default(1),
  })).min(1, "Pelo menos um item é necessário"),
});

type FormData = z.infer<typeof quoteFormSchema>;

export default function Quotes({ currentUser }: { currentUser?: any }) {
  // Obter usuário atual logado
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteWithClient | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithClient | null>(null);
  const [items, setItems] = useState<Array<{ type: string; description: string; amount: string; quantity: number }>>([{ type: "servico", description: "", amount: "", quantity: 1 }]);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [askSignatureModalOpen, setAskSignatureModalOpen] = useState(false);
  const [pdfBlobForSign, setPdfBlobForSign] = useState<Blob | null>(null);
  const [quoteForSign, setQuoteForSign] = useState<QuoteWithClient | null>(null);
  const [shouldSignDocument, setShouldSignDocument] = useState(false);
  

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      title: "",
      description: "",
      clientId: 0,
      items: [{ type: "servico", description: "", amount: "", quantity: 1 }],
    },
  });

  // Queries
  const { data: quotes = [], isLoading } = useQuery<QuoteWithClient[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // Calculate total from items
  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (amount * quantity);
    }, 0);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const total = calculateTotal(data.items);
      const response = await apiRequest("POST", "/api/quotes", {
        ...data,
        items: JSON.stringify(data.items),
        total: total,
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Failed to create quote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setShowQuoteDialog(false);
      form.reset();
      setItems([{ type: "servico", description: "", amount: "", quantity: 1 }]);
      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso!",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const total = calculateTotal(data.items);
      const response = await apiRequest("PATCH", `/api/quotes/${id}`, {
        ...data,
        items: JSON.stringify(data.items),
        total: total,
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Failed to update quote");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setShowQuoteDialog(false);
      setEditingQuote(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso!",
      });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/quotes/${id}`, {
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Failed to delete quote");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso!",
      });
    },
  });

  const transformQuoteToServiceMutation = useMutation({
    mutationFn: async (quote: QuoteWithClient) => {
      // Calculate total from items
      const items = quote.items ? JSON.parse(quote.items) : [];
      const totalValue = calculateTotal(items);
      
      console.log("=== CONVERTENDO ORÇAMENTO PARA SERVIÇO ===");
      console.log("Itens do orçamento:", items);
      console.log("Valor total calculado:", totalValue);
      
      const serviceData = {
        name: quote.title, // Usar título do orçamento como nome do serviço
        description: quote.description || quote.title,
        basePrice: totalValue.toString(),
        category: "orçamento",
        clientId: quote.clientId, // Preservar cliente
        callId: quote.callId, // Preservar chamado se existir
        products: JSON.stringify(items), // Preservar itens como produtos
        estimatedTime: null,
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      };

      const response = await apiRequest("POST", "/api/services", serviceData);
      if (!response.ok) {
        throw new Error("Failed to create service");
      }

      const deleteResponse = await apiRequest("DELETE", `/api/quotes/${quote.id}`);
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete quote");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setSelectedQuote(null);
      toast({
        title: "Sucesso",
        description: "Orçamento transformado em serviço preservando todas as informações!",
      });
    },
    onError: (error) => {
      console.error("Transform quote error:", error);
      toast({
        title: "Erro",
        description: "Erro ao transformar orçamento em serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const transformQuoteToInvoiceMutation = useMutation({
    mutationFn: async (quote: QuoteWithClient) => {
      // Calculate total from items
      const items = quote.items ? JSON.parse(quote.items) : [];
      const totalValue = calculateTotal(items);
      
      console.log("=== CONVERTENDO ORÇAMENTO PARA FATURAMENTO ===");
      console.log("Quote original:", quote);
      console.log("Itens do orçamento:", items);
      console.log("Valor total calculado:", totalValue);
      
      // Build description with items breakdown
      let preservedDescription = quote.description || quote.title || `Faturamento - Orçamento #${quote.id}`;
      
      // Add items to description for financial tracking
      if (items.length > 0) {
        const itemsDescription = items.map((item: any) => 
          `${item.description} - R$ ${item.amount}`
        ).join('; ');
        preservedDescription += `\nItens: ${itemsDescription}`;
      }
      
      console.log("Descrição preservada para faturamento:", preservedDescription);
      
      const transactionData = {
        description: preservedDescription,
        clientId: quote.clientId,
        amount: totalValue,
        type: "entrada",
        status: "pendente",
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      };

      console.log("Dados da transação:", transactionData);

      const response = await apiRequest("POST", "/api/financial-transactions", transactionData);
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const newTransaction = await response.json();
      console.log("Transação criada com descrição:", newTransaction.description);

      const deleteResponse = await apiRequest("DELETE", `/api/quotes/${quote.id}`);
      if (!deleteResponse.ok) {
        throw new Error("Failed to delete quote");
      }

      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-transactions"] });
      setSelectedQuote(null);
      toast({
        title: "Sucesso",
        description: "Orçamento enviado para faturamento com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Transform quote to invoice error:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar orçamento para faturamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleEdit = (quote: QuoteWithClient) => {
    setEditingQuote(quote);
    const quoteItems = quote.items ? JSON.parse(quote.items).map((i: any) => ({...i, quantity: i.quantity || 1})) : [{ type: "servico", description: "", amount: "", quantity: 1 }];
    setItems(quoteItems);
    form.reset({
      title: quote.title,
      description: quote.description || "",
      clientId: quote.clientId,
      items: quoteItems,
    });
    setShowQuoteDialog(true);
  };

  const handleView = (quote: QuoteWithClient) => {
    setSelectedQuote(quote);
  };

  const handleDelete = (quote: QuoteWithClient) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteQuoteMutation.mutate(quote.id);
    }
  };

  const handleGeneratePDF = async (quote: QuoteWithClient) => {
    try {
      console.log("=== INICIANDO GERAÇÃO DE PDF DO ORÇAMENTO ===");
      console.log("Quote data:", quote);
      console.log("Client data:", quote.client);
      
      const result = await generateQuotePDF(quote, quote.client);
      if (result) {
        setPdfData(result);
        
        const response = await fetch(result.dataUrl);
        const blob = await response.blob();
        setPdfBlobForSign(blob);
        setQuoteForSign(quote);
        
        // ABRIR DIALOG PERGUNTANDO SE DESEJA ASSINAR
        setAskSignatureModalOpen(true);
      }
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar PDF: ${error?.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  };

  const handleSignatureResponse = (wantToSign: boolean) => {
    setAskSignatureModalOpen(false);
    setShouldSignDocument(wantToSign);
    
    if (wantToSign) {
      // Abrir o modal de assinatura
      setSignatureModalOpen(true);
    } else {
      // Ir direto para o visualizador de PDF
      setPdfViewerOpen(true);
    }
  };

  const handleDownloadOriginal = () => {
    if (pdfData) {
      const a = document.createElement('a');
      a.href = pdfData.dataUrl;
      a.download = pdfData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "PDF Baixado", 
        description: "Orçamento baixado com sucesso!",
      });
    }
  };

  const handleGeneratePDFOLD = async (quote: QuoteWithClient) => {
    try {
      // Buscar template padrão para orçamentos
      const defaultTemplateResponse = await fetch('/api/templates/default/orcamento');
      let template = null;
      
      if (defaultTemplateResponse.ok) {
        template = await defaultTemplateResponse.json();
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Erro",
          description: "Não foi possível abrir a janela de impressão.",
          variant: "destructive",
        });
        return;
      }

      const items = quote.items ? JSON.parse(quote.items) : [];
      let htmlContent = '';
      
      if (template) {
        // Gerar tabela de itens
        const itemsTable = items.length > 0 ? `
          <table class="items-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Descrição</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R$ ${item.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>Nenhum item especificado</p>';
        
        // Gerar HTML do template baseado nas informações
        const templateHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>ORÇAMENTO #${quote.id.toString().padStart(3, "0")} - ${template.companyName}</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .logo { max-width: 200px; margin-bottom: 20px; }
              .content { margin: 30px 0; }
              .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
              ${template.customCss || ''}
            </style>
          </head>
          <body>
            <div class="header">
              ${template.logoUrl ? `<img src="${template.logoUrl}" class="logo" alt="Logo" />` : ''}
              <h1>${template.companyName}</h1>
              ${template.companyAddress ? `<p>${template.companyAddress}</p>` : ''}
              ${template.companyPhone ? `<p>Telefone: ${template.companyPhone}</p>` : ''}
              ${template.companyEmail ? `<p>Email: ${template.companyEmail}</p>` : ''}
              ${template.headerContent || ''}
            </div>
            
            <div class="content">
              <h2>ORÇAMENTO #${quote.id.toString().padStart(3, "0")}</h2>
              <p><strong>Cliente:</strong> ${quote.client?.name || 'N/A'}</p>
              <p><strong>Data:</strong> ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
              <p><strong>Descrição:</strong> ${quote.title || 'Orçamento'}</p>
              
              ${itemsTable}
              
              <div class="total">
                <p><strong>Total: R$ ${quote.total}</strong></p>
              </div>
            </div>
            
            <div class="footer">
              ${template.footerContent || ''}
            </div>
          </body>
          </html>
        `;
        
        htmlContent = templateHtml;
          
        if (template.logoUrl) {
          htmlContent = htmlContent.replace(/\{\{logo\}\}/g, `<img src="${template.logoUrl}" style="max-width: 200px; margin-bottom: 20px;" alt="Logo" class="logo" />`);
        } else {
          htmlContent = htmlContent.replace(/\{\{logo\}\}/g, '');
        }

        // Adicionar CSS personalizado se existir
        if (template.customCss) {
          htmlContent = htmlContent.replace('</style>', `${template.customCss}\n</style>`);
        }
        
        // Envolver em HTML completo se necessário
        if (!htmlContent.includes('<html')) {
          htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Orçamento #${quote.id} - ${template.companyName || 'Apoiotec Informática'}</title>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; }
                .quote-info { margin-bottom: 20px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; font-size: 18px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
            </html>
          `;
        }
      } else {
        // Template padrão se não encontrar "Orçamentos"
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Orçamento #${quote.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .quote-info { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; font-size: 18px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ORÇAMENTO</h1>
              <p>Orçamento #${quote.id.toString().padStart(3, "0")}</p>
            </div>
            
            <div class="quote-info">
              <p><strong>Cliente:</strong> ${quote.client?.name || 'N/A'}</p>
              <p><strong>Data:</strong> ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
              <p><strong>Título:</strong> ${quote.title}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>R$ ${item.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              <p>Total: R$ ${quote.total}</p>
            </div>
          </body>
          </html>
        `;
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      
      // Fallback para template padrão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const items = quote.items ? JSON.parse(quote.items) : [];
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Orçamento #${quote.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .quote-info { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; font-size: 18px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ORÇAMENTO</h1>
              <p>Orçamento #${quote.id}</p>
            </div>
            
            <div class="quote-info">
              <p><strong>Cliente:</strong> ${quote.client?.name || 'N/A'}</p>
              <p><strong>Data:</strong> ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
              <p><strong>Título:</strong> ${quote.title}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>R$ ${item.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total">
              <p>Total: R$ ${quote.total}</p>
            </div>
          </body>
          </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const onSubmit = (data: FormData) => {
    if (editingQuote) {
      updateMutation.mutate({ id: editingQuote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Orçamentos</h1>
        <Button onClick={() => setShowQuoteDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Carregando orçamentos...</p>
        </div>
      ) : quotes.length === 0 ? (
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 font-semibold">Nenhum orçamento encontrado</p>
            <p className="text-gray-500 dark:text-gray-400">
              {quotes.length === 0 
                ? "Crie seu primeiro orçamento clicando no botão acima."
                : "Tente ajustar os filtros para encontrar o que procura."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.map((quote: QuoteWithClient) => (
            <Card key={quote.id} className={`bg-white dark:bg-slate-800 border-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group flex flex-col h-full shadow-lg ${
              quote.status === "aprovado" ? "border-green-500 dark:border-green-400 hover:shadow-green-500/50 dark:shadow-green-500/20" :
              quote.status === "rejeitado" ? "border-red-500 dark:border-red-400 hover:shadow-red-500/50 dark:shadow-red-500/20" :
              "border-yellow-500 dark:border-yellow-400 hover:shadow-yellow-500/50 dark:shadow-yellow-500/20"
            }`}>
              <CardContent className="p-0 flex flex-col flex-1">
                
                <div className="p-4 space-y-3 flex-1">
                  {/* Cliente */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Cliente</p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {quote.client?.name || "Sem cliente"}
                    </p>
                  </div>

                  {/* Título do orçamento */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Orçamento</p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {quote.title}
                    </p>
                  </div>

                  {/* Descrição */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {quote.description || "Sem descrição"}
                    </p>
                  </div>

                  {/* Data e Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(quote.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(quote.status === "pendente" ? "pendente" : quote.status === "aprovado" ? "concluido" : "cancelado")} text-xs h-6 border font-semibold`}>
                      {quote.status === "pendente" ? "Pendente" : 
                       quote.status === "aprovado" ? "Aprovado" : 
                       quote.status === "rejeitado" ? "Rejeitado" : quote.status}
                    </Badge>
                  </div>

                  {/* Valor Total */}
                  <div className="pt-1">
                    <span className="font-bold text-lg text-purple-600">
                      R$ {quote.total}
                    </span>
                  </div>
                </div>

                {/* Ações - grid compacto na parte inferior - SEMPRE NO BOTTOM */}
                <div className="p-4 pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
                    <div className="grid grid-cols-3 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(quote);
                        }}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1"
                        title="Ver Detalhes"
                        data-testid={`button-view-${quote.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(quote);
                        }}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1"
                        title="Editar Orçamento"
                        data-testid={`button-edit-${quote.id}`}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGeneratePDF(quote);
                        }}
                        className="h-8 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex flex-col items-center justify-center p-1"
                        title="Gerar PDF"
                        data-testid={`button-pdf-${quote.id}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          transformQuoteToServiceMutation.mutate(quote);
                        }}
                        className="h-8 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col items-center justify-center p-1"
                        title="Converter para Serviço"
                        data-testid={`button-service-${quote.id}`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quote);
                        }}
                        className="h-8 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex flex-col items-center justify-center p-1"
                        title="Deletar Orçamento"
                        data-testid={`button-delete-${quote.id}`}
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

      {/* Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle>
              {editingQuote ? "Editar Orçamento" : "Novo Orçamento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingQuote ? "Atualizar" : "Criar"} Orçamento
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Quote Dialog */}
      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Orçamento #{selectedQuote.id.toString().padStart(3, "0")}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informações do Cliente</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Nome:</strong> {selectedQuote.client?.name || "N/A"}
                    </p>
                    {selectedQuote.client?.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Email:</strong> {selectedQuote.client.email}
                      </p>
                    )}
                    {selectedQuote.client?.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Telefone:</strong> {selectedQuote.client.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalhes do Orçamento</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Status:</strong> {selectedQuote.status}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Data:</strong> {new Date(selectedQuote.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Total:</strong> R$ {selectedQuote.total}
                    </p>
                  </div>
                </div>
              </div>

              {selectedQuote.description && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Descrição</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedQuote.description}</p>
                  </div>
                </div>
              )}

              {selectedQuote.items && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Itens</h4>
                  
                  {/* Mobile: Card Layout */}
                  <div className="block sm:hidden space-y-3">
                    {JSON.parse(selectedQuote.items).map((item: any, index: number) => {
                      const qty = item.quantity || 1;
                      const subtotal = (parseFloat(item.amount) * qty).toFixed(2);
                      return (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 mr-3">
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{qty}x {item.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.type === "servico" ? "🔧 Serviço" : "⚙️ Produto"} - R$ {item.amount}
                              </p>
                            </div>
                            <p className="font-bold text-sm text-green-600 dark:text-green-400">R$ {subtotal}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: Table Layout */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-900 dark:text-white">Tipo</th>
                          <th className="px-4 py-3 text-left text-gray-900 dark:text-white">Descrição</th>
                          <th className="px-4 py-3 text-center text-gray-900 dark:text-white">Qtd</th>
                          <th className="px-4 py-3 text-right text-gray-900 dark:text-white">Valor Un.</th>
                          <th className="px-4 py-3 text-right text-gray-900 dark:text-white">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {JSON.parse(selectedQuote.items).map((item: any, index: number) => {
                          const qty = item.quantity || 1;
                          const subtotal = (parseFloat(item.amount) * qty).toFixed(2);
                          return (
                            <tr key={index} className="border-t dark:border-gray-700">
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {item.type === "servico" ? "🔧 Serviço" : "⚙️ Produto"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.description}</td>
                              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{qty}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">R$ {item.amount}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">R$ {subtotal}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                {/* Mobile: Stacked Layout */}
                <div className="block sm:hidden space-y-2">
                  <Button
                    onClick={() => {
                      setSelectedQuote(null);
                      handleEdit(selectedQuote!);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    onClick={() => handleGeneratePDF(selectedQuote!)}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 dark:hover:from-green-800/30 dark:hover:to-emerald-700/30 border-4 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Baixar PDF
                  </Button>
                  
                  <Button
                    onClick={() => transformQuoteToServiceMutation.mutate(selectedQuote!)}
                    variant="outline"
                    className="w-full"
                    disabled={transformQuoteToServiceMutation.isPending}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {transformQuoteToServiceMutation.isPending ? "Convertendo..." : "Converter em Serviço"}
                  </Button>
                  
                  <Button
                    onClick={() => transformQuoteToInvoiceMutation.mutate(selectedQuote!)}
                    variant="outline"
                    className="w-full"
                    disabled={transformQuoteToInvoiceMutation.isPending}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {transformQuoteToInvoiceMutation.isPending ? "Enviando..." : "Enviar para Faturamento"}
                  </Button>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <Button
                    onClick={() => {
                      setSelectedQuote(null);
                      handleEdit(selectedQuote!);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    onClick={() => handleGeneratePDF(selectedQuote!)}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 dark:hover:from-green-800/30 dark:hover:to-emerald-700/30 border-4 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Baixar PDF
                  </Button>
                  
                  <Button
                    onClick={() => transformQuoteToServiceMutation.mutate(selectedQuote!)}
                    variant="outline"
                    className="w-full"
                    disabled={transformQuoteToServiceMutation.isPending}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Serviço
                  </Button>
                  
                  <Button
                    onClick={() => transformQuoteToInvoiceMutation.mutate(selectedQuote!)}
                    variant="outline"
                    className="w-full"
                    disabled={transformQuoteToInvoiceMutation.isPending}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Faturamento
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto sm:max-h-none bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingQuote ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do orçamento" {...field} className="h-9" />
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
                      <FormLabel className="text-sm">Cliente</FormLabel>
                      <FormControl>
                        <ClientSearch
                          value={field.value}
                          onSelect={(clientId, client) => {
                            field.onChange(clientId);
                          }}
                          placeholder="Digite para buscar um cliente..."
                          className="h-9"
                        />
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
                      <FormLabel className="text-sm">Descrição</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Descrição opcional" 
                          {...field} 
                          value={field.value || ""} 
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Itens do Orçamento</label>
                <div className="space-y-3">
                  {items.map((_, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Item #{index + 1}
                        </span>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = items.filter((_, i) => i !== index);
                              setItems(newItems);
                              form.setValue("items", newItems);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                        <FormField
                          control={form.control}
                          name={`items.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tipo</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const newItems = [...items];
                                  newItems[index].type = value;
                                  setItems(newItems);
                                }} 
                                defaultValue={field.value || "servico"}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="servico">🔧 Serviço</SelectItem>
                                  <SelectItem value="produto">⚙️ Produto</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-xs">Descrição</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Descrição do item" 
                                  {...field} 
                                  className="h-9"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Qtd</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1" 
                                  {...field} 
                                  className="h-9"
                                  type="number"
                                  step="1"
                                  min="1"
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value) || 1);
                                    const newItems = [...items];
                                    newItems[index].quantity = parseInt(e.target.value) || 1;
                                    setItems(newItems);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Valor (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="150.00" 
                                  {...field} 
                                  className="h-9"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newItems = [...items, { type: "servico", description: "", amount: "", quantity: 1 }];
                      setItems(newItems);
                      form.setValue("items", newItems);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                  
                  {/* Total Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-4 border-blue-200 dark:border-blue-700 rounded-lg p-4 min-w-[200px]">
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total do Orçamento</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        R$ {calculateTotal(items).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-4 border-t sm:flex-row sm:justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowQuoteDialog(false);
                    setEditingQuote(null);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Salvando..." 
                    : editingQuote ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
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

      {/* Ask Signature Modal - Dialog Perguntando se Deseja Assinar */}
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
        documentId={quoteForSign?.id || 0}
        documentName={pdfData?.filename?.replace('.pdf', '') || `orcamento_${quoteForSign?.id}`}
        userId={loggedUser?.id}
        onDownloadOriginal={handleDownloadOriginal}
        onSignSuccess={(signedPdfBase64) => {
          // Converter PDF assinado base64 para dataUrl
          const dataUrl = `data:application/pdf;base64,${signedPdfBase64}`;
          setPdfData({
            dataUrl,
            filename: pdfData?.filename || `orcamento_${quoteForSign?.id}.pdf`
          });
        }}
      />
    </div>
  );
}