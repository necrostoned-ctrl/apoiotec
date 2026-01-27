import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertClientSchema, type Client } from "@shared/schema";
import { Plus, Search, Eye, Edit, Trash2, User, Phone, Mail, MapPin, FileText, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ClientNotesDialog } from "@/components/ClientNotesDialog";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { z } from "zod";

type ClientFormData = z.infer<typeof insertClientSchema>;

export default function Clients({ currentUser }: { currentUser?: any }) {
  // Obter usuário atual logado
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedClientForNotes, setSelectedClientForNotes] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      documentType: "cpf",
      address: "",
      city: "",
      state: "",
      status: "ativo",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", {
        ...data,
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsDialogOpen(false);
      setEditingClient(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClientFormData }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, {
        ...data,
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsDialogOpen(false);
      setEditingClient(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/clients/${id}`, {
        currentUserId: loggedUser?.id || 1,  // CRÍTICO: Usar currentUserId para notificações
        userId: loggedUser?.id || 1
      });
      if (!response.ok) {
        throw new Error("Erro ao excluir cliente");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });


  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      cpf: client.cpf || "",
      documentType: (client as any).documentType || "cpf",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      status: client.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      deleteClientMutation.mutate(client.id);
    }
  };

  const handleOpenNotes = (client: Client) => {
    setSelectedClientForNotes(client);
    setShowNotesDialog(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.phone && client.phone.includes(searchTerm));
    const matchesStatus = !statusFilter || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6 pb-32">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-400 mb-2">Clientes</h2>
          <p className="text-gray-400">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={handleAddClient} className="bg-indigo-600 hover:bg-indigo-700 border-4 border-indigo-500 dark:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/50 dark:shadow-indigo-500/20 shadow-lg w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros Card com Colapsável */}
      <Card className="mb-6 bg-white dark:bg-slate-800 border-0 shadow-md">
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
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        )}
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="bg-white dark:bg-slate-800 border-4 border-cyan-500 dark:border-cyan-400 shadow-lg dark:shadow-cyan-500/20 transition-all">
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 font-semibold">Nenhum cliente encontrado</p>
            <p className="text-gray-500 dark:text-gray-400">
              {clients.length === 0 
                ? "Comece adicionando seu primeiro cliente" 
                : "Tente ajustar os filtros de busca"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
          </div>
          
          {/* Responsive Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...filteredClients].sort((a, b) => a.name.localeCompare(b.name)).map((client) => (
              <Card key={client.id} className="bg-white dark:bg-slate-800 border-4 border-blue-500 dark:border-blue-400 hover:shadow-lg hover:shadow-blue-500/50 shadow-lg dark:shadow-blue-500/20 transition-all overflow-hidden rounded-lg flex flex-col">
                <CardContent className="p-2 flex-1 flex flex-col">
                  {/* Header com Ícone e Nome */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <div className="h-6 w-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-md flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm sm:text-xs font-bold text-gray-900 dark:text-white break-words line-clamp-3">{client.name}</h3>
                    </div>
                    <Badge 
                      className={`flex-shrink-0 text-xs font-semibold rounded-full ${getStatusColor(client.status === "ativo" ? "concluido" : "cancelado")}`}
                    >
                      {client.status === "ativo" ? "✓" : "○"}
                    </Badge>
                  </div>

                  {/* Informações */}
                  <div className="space-y-0.5 mb-2 flex-1">
                    {client.phone && (
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{client.phone}</span>
                      </div>
                    )}
                    
                    {client.email && (
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{client.email}</span>
                      </div>
                    )}
                    
                    {client.city && (
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {client.city}{client.state ? `, ${client.state}` : ''}
                        </span>
                      </div>
                    )}

                    {client.cpf && (
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className="h-3 w-3 text-purple-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{client.cpf}</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação - Só Ícones */}
                  <div className="flex items-center justify-center gap-1 pt-1 border-t border-gray-200 dark:border-slate-700 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingClient(client)}
                      className="h-6 w-6 p-0 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Ver detalhes"
                      data-testid={`button-view-${client.id}`}
                    >
                      <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="h-6 w-6 p-0 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      title="Editar cliente"
                      data-testid={`button-edit-${client.id}`}
                    >
                      <Edit className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenNotes(client)}
                      className="h-6 w-6 p-0 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Notas do cliente"
                      data-testid={`button-notes-${client.id}`}
                    >
                      <BookOpen className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
                      className="h-6 w-6 p-0 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Deletar cliente"
                      data-testid={`button-delete-${client.id}`}
                    >
                      <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "cpf"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{form.watch("documentType") === "cnpj" ? "CNPJ" : "CPF"}</FormLabel>
                      <FormControl>
                        <Input placeholder={form.watch("documentType") === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
                
                {/* Botões fixos no final */}
                <div className="flex-shrink-0 flex gap-2 justify-end pt-4 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createClientMutation.isPending || updateClientMutation.isPending}
                  >
                    {(createClientMutation.isPending || updateClientMutation.isPending)
                      ? "Salvando..."
                      : editingClient
                      ? "Atualizar"
                      : "Criar Cliente"
                    }
                  </Button>
                </div>
              </form>
            </Form>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      {viewingClient && (
        <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-red-500 shadow-2xl shadow-red-500/30">
            <DialogHeader>
              <DialogTitle className="text-2xl">Detalhes do Cliente</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Cabeçalho com Avatar e Info Principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{viewingClient.name}</h3>
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(viewingClient.status === "ativo" ? "concluido" : "cancelado")} text-sm border font-semibold`}
                    >
                      {viewingClient.status === "ativo" ? "✓ Ativo" : "○ Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cards de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card de Contato */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Contato</h4>
                  </div>
                  <div className="space-y-3">
                    {viewingClient.phone ? (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{viewingClient.phone}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Telefone não cadastrado</p>
                    )}
                    {viewingClient.email ? (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium truncate">{viewingClient.email}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email não cadastrado</p>
                    )}
                  </div>
                </div>

                {/* Card de Documentos */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-purple-500 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Documentos</h4>
                  </div>
                  <div className="space-y-3">
                    {viewingClient.cpf ? (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                          {(viewingClient as any).documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{viewingClient.cpf}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">CPF/CNPJ não cadastrado</p>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Cliente Desde</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{formatDate(viewingClient.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Endereço - Full Width */}
              {(viewingClient.address || viewingClient.city) && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Endereço</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded space-y-1">
                    {viewingClient.address && (
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{viewingClient.address}</p>
                    )}
                    {viewingClient.city && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewingClient.city}{viewingClient.state ? `, ${viewingClient.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setViewingClient(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setViewingClient(null);
                  handleEditClient(viewingClient);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Notes Dialog */}
      {selectedClientForNotes && (
        <ClientNotesDialog
          open={showNotesDialog}
          onOpenChange={setShowNotesDialog}
          clientId={selectedClientForNotes.id}
          clientName={selectedClientForNotes.name}
        />
      )}
    </div>
  );
}