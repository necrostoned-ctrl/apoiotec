import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Package, Wrench, TrendingUp, AlertTriangle, FileText, Download, Search, Calendar, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInventoryProductSchema, insertInventoryServiceSchema, type InventoryProduct, type InventoryService } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { PDFViewer } from "@/components/PDFViewer";
import { generateInventoryReportPDF } from "@/utils/professionalPdfGenerator";

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [productSearch, setProductSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Queries
  const { data: products = [] } = useQuery({ queryKey: ["/api/inventory/products"] }) as any;
  const { data: services = [] } = useQuery({ queryKey: ["/api/inventory/services"] }) as any;
  const { data: movements = [] } = useQuery({ queryKey: ["/api/inventory/movements"] }) as any;
  const { data: stats = { totalValue: 0, criticalCount: 0 } } = useQuery({ queryKey: ["/api/inventory/stats"] }) as any;

  // Product Form
  const productForm = useForm<any>({ 
    resolver: zodResolver(insertInventoryProductSchema), 
    defaultValues: editingProduct || { minAlert: 2 }
  });
  
  // Service Form
  const serviceForm = useForm<any>({ 
    resolver: zodResolver(insertInventoryServiceSchema), 
    defaultValues: editingService || {}
  });

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest(editingProduct ? "PATCH" : "POST", 
      editingProduct ? `/api/inventory/products/${editingProduct.id}` : "/api/inventory/products", 
      data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      setShowProductModal(false);
      setEditingProduct(null);
      productForm.reset({ minAlert: 2 });
      toast({ title: "Produto salvo com sucesso!" });
    },
    onError: (error: any) => {
      console.error("Erro ao salvar produto:", error);
      toast({ title: "Erro ao salvar produto", description: error.message || "Tente novamente" });
    }
  });

  const saveServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest(editingService ? "PATCH" : "POST",
      editingService ? `/api/inventory/services/${editingService.id}` : "/api/inventory/services",
      data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/services"] });
      setShowServiceModal(false);
      setEditingService(null);
      serviceForm.reset();
      toast({ title: "Serviço salvo com sucesso!" });
    },
    onError: (error: any) => {
      console.error("Erro ao salvar serviço:", error);
      toast({ title: "Erro ao salvar serviço", description: error.message || "Tente novamente" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "Produto deletado!" });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/services"] });
      toast({ title: "Serviço deletado!" });
    }
  });

  const clearAllProductsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/inventory/products-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({ title: "✅ Todos os produtos foram deletados!" });
    },
    onError: (error: any) => {
      toast({ title: "❌ Erro ao limpar estoque", variant: "destructive" });
    }
  });

  const clearAllMovementsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/inventory/movements-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      toast({ title: "✅ Todas as movimentações foram deletadas!" });
    },
    onError: (error: any) => {
      toast({ title: "❌ Erro ao limpar movimentações", variant: "destructive" });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      console.log("📊 Iniciando geração do relatório de estoque...");
      const payload: any = { period: reportPeriod };
      if (reportPeriod === "custom" && customStartDate && customEndDate) {
        payload.startDate = customStartDate;
        payload.endDate = customEndDate;
      }
      const response = await apiRequest("POST", "/api/inventory/report-data", payload);
      const data = await response.json();
      console.log("📦 Dados recebidos:", {
        products: data.products.length,
        movements: data.movements.length,
        outgoing: data.movements.filter((m: any) => m.type === 'saida').length
      });
      const result = await generateInventoryReportPDF(data.products, data.movements, data.services);
      console.log("✅ Relatório gerado com sucesso");
      return result;
    },
    onSuccess: (data: any) => {
      setPdfData(data);
      setPdfViewerOpen(true);
      toast({ title: "Relatório gerado com sucesso!" });
    },
    onError: (error: any) => {
      console.error("❌ Erro ao gerar relatório:", error);
      toast({ title: "Erro ao gerar relatório", variant: "destructive" });
    }
  });

  const criticalProducts = products.filter((p: any) => parseInt(p.quantity) <= p.minAlert);

  // Autocomplete filtering
  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()))
    ).slice(0, 5);
  }, [productSearch, products]);

  const filteredServices = useMemo(() => {
    if (!serviceSearch) return [];
    return services.filter((s: any) => 
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()))
    ).slice(0, 5);
  }, [serviceSearch, services]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
            <Package className="w-10 h-10 text-cyan-400" />
            Estoque
          </h1>
          <p className="text-gray-400 mt-2">Gerencie produtos e serviços do seu inventário</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black border-2 border-cyan-500 shadow-xl shadow-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-300 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Total Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{products.length}</div>
            <p className="text-xs text-cyan-300/60 mt-1">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-2 border-blue-500 shadow-xl shadow-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Total Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{services.length}</div>
            <p className="text-xs text-blue-300/60 mt-1">serviços cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-2 border-red-500 shadow-xl shadow-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Em Alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{criticalProducts.length}</div>
            <p className="text-xs text-red-300/60 mt-1">produtos com estoque baixo</p>
          </CardContent>
        </Card>

        <Card className="bg-black border-2 border-green-500 shadow-xl shadow-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">R$ {(stats?.totalValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-green-300/60 mt-1">valor em estoque</p>
          </CardContent>
        </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent rounded-xl gap-2 p-0">
          <TabsTrigger value="products" className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg border-2 border-green-500 bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-lg shadow-green-500/50 data-[state=active]:bg-green-600 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/80">
            <Package className="w-5 h-5" /> Produtos
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center justify-center gap-2 py-3 px-6 rounded-lg border-2 border-blue-500 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/50 data-[state=active]:bg-blue-600 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/80">
            <Wrench className="w-5 h-5" /> Serviços
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="bg-black border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 mb-6">
            <CardHeader className="border-b-2 border-cyan-500">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <CardTitle className="text-cyan-400 flex items-center gap-2"><Package className="w-6 h-6" /> Produtos em Estoque</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="flex gap-2 items-center bg-black/50 p-2 rounded-lg border-2 border-cyan-500">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="w-40 bg-black border-cyan-500 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-cyan-500">
                        <SelectItem value="all">Todos os períodos</SelectItem>
                        <SelectItem value="thisMonth">Mês atual</SelectItem>
                        <SelectItem value="lastMonth">Último mês</SelectItem>
                        <SelectItem value="custom">Período personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {reportPeriod === "custom" && (
                    <div className="flex gap-2">
                      <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-2 py-1 bg-black border-2 border-cyan-500 text-white rounded text-sm" />
                      <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-2 py-1 bg-black border-2 border-cyan-500 text-white rounded text-sm" />
                    </div>
                  )}
                  <Button onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending} className="relative overflow-hidden bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg border-2 border-cyan-400 shadow-lg shadow-cyan-500/50 transition-all duration-200 hover:shadow-cyan-500/80 disabled:opacity-50">
                    <Download className="w-4 h-4 mr-2 inline" /> {generateReportMutation.isPending ? "Gerando..." : "Relatório PDF"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="relative overflow-hidden bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg border-2 border-red-400 shadow-lg shadow-red-500/50 transition-all duration-200 hover:shadow-red-500/80">
                        <Zap className="w-4 h-4 mr-2 inline" /> Zerar Estoque
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black border-2 border-red-500">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">⚠️ Deletar todos os produtos?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Isso vai deletar TODOS os produtos do estoque. Esta ação não pode ser desfeita!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex gap-2">
                        <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearAllProductsMutation.mutate()} className="bg-red-600 hover:bg-red-700 text-white">Deletar Tudo</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button onClick={() => { setEditingProduct(null); productForm.reset({ minAlert: 2 }); setShowProductModal(true); }} className="relative overflow-hidden bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg border-2 border-green-400 shadow-lg shadow-green-500/50 transition-all duration-200 hover:shadow-green-500/80">
                    <Plus className="w-4 h-4 mr-2 inline" /> Novo Produto
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {criticalProducts.length > 0 && (
                <div className="mb-6 p-4 bg-red-900/40 border-2 border-red-500 rounded-lg shadow-lg shadow-red-500/30">
                  <p className="text-red-300 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> ⚠️ {criticalProducts.length} produto(s) com estoque crítico!
                  </p>
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(products as InventoryProduct[]).map((product) => (
                    <div key={product.id} className="p-4 bg-slate-800 border-2 border-slate-700 hover:border-cyan-500 rounded-lg transition-all shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-cyan-300 font-bold text-lg">{product.name}</h3>
                            {parseInt(product.quantity.toString()) <= product.minAlert && (
                              <Badge className="bg-red-900 text-red-200 border-2 border-red-600 animate-pulse">🔴 Crítico</Badge>
                            )}
                          </div>
                          {product.description && <p className="text-slate-400 text-sm mb-3">{product.description}</p>}
                          <div className="flex gap-6 text-sm font-semibold">
                            <span className="text-cyan-400">📦 Qtd: <strong className="text-cyan-300">{product.quantity}</strong></span>
                            <span className="text-green-400">💰 R$ {formatCurrency(product.price)}</span>
                            <span className="text-yellow-400">⚠️ Crítico: {product.minAlert} un</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { setEditingProduct(product); productForm.reset(product); setShowProductModal(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md border-2 border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => deleteProductMutation.mutate(product.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md border-2 border-red-400 transition-all hover:shadow-lg hover:shadow-red-500/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Section: Clear Movements */}
          <Card className="bg-black border-2 border-orange-500 shadow-lg shadow-orange-500/20 mt-6">
            <CardHeader className="border-b-2 border-orange-500">
              <CardTitle className="text-orange-400 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Movimentações de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-300 mb-4">Total de movimentações registradas: <strong className="text-orange-400">{movements.length}</strong></p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="relative overflow-hidden bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg border-2 border-orange-400 shadow-lg shadow-orange-500/50 transition-all duration-200 hover:shadow-orange-500/80">
                    <Zap className="w-4 h-4 mr-2 inline" /> Zerar Movimentações
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-2 border-orange-500">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-orange-400">⚠️ Deletar todas as movimentações?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Isso vai deletar TODAS as movimentações de estoque. Esta ação não pode ser desfeita!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2">
                    <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => clearAllMovementsMutation.mutate()} className="bg-orange-600 hover:bg-orange-700 text-white">Deletar Tudo</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card className="bg-black border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
            <CardHeader className="border-b-2 border-cyan-500">
              <div className="flex justify-between items-center">
                <CardTitle className="text-cyan-400 flex items-center gap-2"><Wrench className="w-6 h-6" /> Serviços Cadastrados</CardTitle>
                <Button onClick={() => { setEditingService(null); serviceForm.reset(); setShowServiceModal(true); }} className="relative overflow-hidden bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg border-2 border-green-400 shadow-lg shadow-green-500/50 transition-all duration-200 hover:shadow-green-500/80">
                  <Plus className="w-4 h-4 mr-2 inline" /> Novo Serviço
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhum serviço cadastrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(services as InventoryService[]).map((service) => (
                    <div key={service.id} className="p-4 bg-slate-800 border-2 border-slate-700 hover:border-cyan-500 rounded-lg transition-all shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-cyan-300 font-bold text-lg">{service.name}</h3>
                            {service.category && <Badge className="bg-cyan-900 text-cyan-200 border-2 border-cyan-600">{service.category}</Badge>}
                          </div>
                          {service.description && <p className="text-slate-400 text-sm mb-3">{service.description}</p>}
                          <span className="text-green-400 font-bold">💰 R$ {formatCurrency(service.price)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => { setEditingService(service); serviceForm.reset(service); setShowServiceModal(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md border-2 border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/50">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => deleteServiceMutation.mutate(service.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md border-2 border-red-400 transition-all hover:shadow-lg hover:shadow-red-500/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

          {/* Product Modal */}
        <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl flex items-center gap-2">{editingProduct ? "✏️ Editar Produto" : "📦 Novo Produto"}</DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit((data) => saveProductMutation.mutate(data))} className="space-y-4">
              <FormField control={productForm.control} name="name" render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-cyan-300">Nome *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <Input {...field} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500 pl-10" placeholder="Ex: Fonte ATX" onChange={(e) => { field.onChange(e); setProductSearch(e.target.value); }} />
                      {filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border-2 border-cyan-500 rounded-lg z-50 shadow-lg max-h-48 overflow-y-auto">
                          {filteredProducts.map((p: any) => (
                            <button key={p.id} type="button" onClick={() => { productForm.setValue("name", p.name); productForm.setValue("description", p.description || ""); productForm.setValue("price", p.price); setProductSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-cyan-500/20 border-b border-slate-700 last:border-0 text-cyan-300 text-sm">
                              <div className="font-semibold">{p.name}</div>
                              {p.description && <div className="text-xs text-slate-400">{p.description}</div>}
                              <div className="text-xs text-green-400">R$ {formatCurrency(p.price)}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={productForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Descrição</FormLabel>
                  <FormControl><Textarea {...field} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="Detalhes do produto..." /></FormControl>
                </FormItem>
              )} />
              <FormField control={productForm.control} name="price" render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Preço *</FormLabel>
                  <FormControl><Input {...field} type="number" step="0.01" value={value || ''} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="0.00" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={productForm.control} name="quantity" render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Quantidade *</FormLabel>
                  <FormControl><Input {...field} type="number" value={value || ''} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={productForm.control} name="minAlert" render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Nível Crítico (padrão 2)</FormLabel>
                  <FormControl><Input {...field} type="number" value={value || ''} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="2" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg border-2 border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/50" disabled={saveProductMutation.isPending}>
                {saveProductMutation.isPending ? "⏳ Salvando..." : "✅ Salvar Produto"}
              </Button>
            </form>
          </Form>
        </DialogContent>
        </Dialog>

        {/* Service Modal */}
        <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-xl flex items-center gap-2">{editingService ? "✏️ Editar Serviço" : "🔧 Novo Serviço"}</DialogTitle>
          </DialogHeader>
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit((data) => saveServiceMutation.mutate(data))} className="space-y-4">
              <FormField control={serviceForm.control} name="name" render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-cyan-300">Nome *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <Input {...field} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500 pl-10" placeholder="Ex: Instalação" onChange={(e) => { field.onChange(e); setServiceSearch(e.target.value); }} />
                      {filteredServices.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border-2 border-cyan-500 rounded-lg z-50 shadow-lg max-h-48 overflow-y-auto">
                          {filteredServices.map((s: any) => (
                            <button key={s.id} type="button" onClick={() => { serviceForm.setValue("name", s.name); serviceForm.setValue("description", s.description || ""); serviceForm.setValue("price", s.price); serviceForm.setValue("category", s.category || ""); setServiceSearch(""); }} className="w-full text-left px-3 py-2 hover:bg-cyan-500/20 border-b border-slate-700 last:border-0 text-cyan-300 text-sm">
                              <div className="font-semibold">{s.name}</div>
                              {s.description && <div className="text-xs text-slate-400">{s.description}</div>}
                              <div className="text-xs text-green-400">R$ {formatCurrency(s.price)} {s.category && `• ${s.category}`}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={serviceForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Descrição</FormLabel>
                  <FormControl><Textarea {...field} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="Detalhes do serviço..." /></FormControl>
                </FormItem>
              )} />
              <FormField control={serviceForm.control} name="price" render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Preço *</FormLabel>
                  <FormControl><Input {...field} type="number" step="0.01" value={value || ''} className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" placeholder="0.00" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={serviceForm.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-300">Categoria</FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: Instalação, Manutenção..." className="bg-slate-800 border-cyan-600 text-white placeholder:text-slate-500" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg border-2 border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/50" disabled={saveServiceMutation.isPending}>
                {saveServiceMutation.isPending ? "⏳ Salvando..." : "✅ Salvar Serviço"}
              </Button>
            </form>
          </Form>
        </DialogContent>
        </Dialog>

        {/* PDF Viewer Modal */}
        {pdfData && (
          <PDFViewer
            open={pdfViewerOpen}
            onOpenChange={(open) => {
              setPdfViewerOpen(open);
              if (!open) setPdfData(null);
            }}
            pdfDataUrl={pdfData.dataUrl}
            filename={pdfData.filename}
          />
        )}
      </div>
    </div>
  );
}
