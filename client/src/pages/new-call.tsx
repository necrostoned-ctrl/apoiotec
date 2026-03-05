import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCallSchema, insertClientSchema, type Client } from "@shared/schema";
import { useLocation } from "wouter";
import { Save, FileText, Plus } from "lucide-react";
import { ClientSearch } from "@/components/ClientSearch";
import { z } from "zod";

const formSchema = insertCallSchema.extend({
  callDateStr: z.string().optional(),
});

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;
type ClientFormData = z.infer<typeof clientFormSchema>;

export default function NewCall({ currentUser }: { currentUser?: any }) {
  const [, setLocation] = useLocation();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState<Client | null>(null);
  const modalOpenRef = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const activeClients = clients.filter(client => client.status === 'ativo');

  // Helper to format date to YYYY-MM-DDThh:mm for datetime-local
  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: null,
      equipment: "",
      serviceType: "",
      priority: "media",
      description: "",
      internalNotes: "",
      status: "aguardando",
      progress: 0,
      callDateStr: getLocalDateTime(),
    },
  });

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      address: "",
      city: "",
      state: "",
      status: "ativo",
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let finalCallDate = new Date();
      if (data.callDateStr) {
        finalCallDate = new Date(data.callDateStr);
      }
      
      const payload = {
        ...data,
        callDate: finalCallDate,
        currentUserId: loggedUser?.id || 1,
        userId: loggedUser?.id || 1,
        createdByUserId: loggedUser?.id || 1
      };
      delete payload.callDateStr;

      const response = await apiRequest("POST", "/api/calls", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Chamado criado com sucesso!",
      });
      setLocation("/calls");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", {
        ...data,
        userId: loggedUser?.id || 1
      });
      return response.json();
    },
    onSuccess: (newClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setNewClientData(newClient);
      setShowNewClientDialog(false);
      toast({
        title: "✅ Cliente Criado!",
        description: `"${newClient.name}" foi adicionado e selecionado.`,
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro ao Criar Cliente",
        description: "Verifique as informações e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (modalOpenRef.current) {
      console.warn("❌ Submissão bloqueada: modal de novo cliente está aberto");
      return;
    }
    createCallMutation.mutate(data);
  };

  const onClientSubmit = (data: ClientFormData) => {
    createClientMutation.mutate(data);
  };

  useEffect(() => {
    modalOpenRef.current = showNewClientDialog;
  }, [showNewClientDialog]);

  useEffect(() => {
    if (!showNewClientDialog && newClientData) {
      const timer = setTimeout(() => {
        form.setValue("clientId", newClientData.id);
        clientForm.reset();
        setNewClientData(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showNewClientDialog, newClientData, form, clientForm]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Novo Chamado</h2>
        <p className="text-gray-400">Registre uma nova solicitação de serviço técnico</p>
      </div>

      <Card className="max-w-4xl mx-auto bg-slate-800 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30">
        <CardHeader className="border-b border-cyan-500/30">
          <CardTitle className="flex items-center text-cyan-300">
            <FileText className="h-5 w-5 mr-2" />
            Informações do Chamado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="text-cyan-300">Cliente</FormLabel>
                        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-cyan-600 hover:bg-cyan-700 text-white border-2 border-cyan-500"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Novo Cliente
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md bg-slate-800 border-2 border-cyan-500 max-h-[85vh] overflow-y-auto shadow-lg shadow-cyan-500/30">
                            <DialogHeader className="sticky top-0 bg-slate-800 pb-4 border-b border-cyan-500/30">
                              <DialogTitle className="text-xl text-cyan-300 font-bold">Novo Cliente</DialogTitle>
                              <DialogDescription className="text-cyan-100 text-sm mt-1">
                                Preencha as informações do cliente. O nome é obrigatório.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...clientForm}>
                              <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-5 py-4">
                                <FormField
                                  control={clientForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-cyan-300 font-semibold">Nome do Cliente *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: João Silva ou Empresa LTDA" {...field} className="bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 h-10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" autoFocus />
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={clientForm.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-cyan-300 font-semibold">Telefone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} className="bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 h-10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={clientForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel className="text-cyan-300 font-semibold">Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="cliente@email.com" {...field} value={field.value || ""} className="bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 h-10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex gap-3 justify-end pt-4 border-t border-cyan-500/30">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowNewClientDialog(false);
                                      setTimeout(() => clientForm.reset(), 50);
                                    }}
                                    className="border-2 border-slate-600 text-cyan-300 hover:bg-slate-700 hover:border-slate-500 font-semibold"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={createClientMutation.isPending}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold border-2 border-cyan-500 hover:border-cyan-400 min-w-[140px]"
                                  >
                                    {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormControl>
                        <ClientSearch
                          value={field.value}
                          onSelect={(clientId) => field.onChange(clientId || null)}
                          placeholder="Digite nome ou telefone do cliente..."
                          allowEmpty={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data e Hora */}
                <FormField
                  control={form.control}
                  name="callDateStr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-300">Data e Hora do Chamado</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          className="bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Equipamento */}
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-300">Equipamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Servidor Dell, Notebook HP, etc." {...field} className="bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
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
                      <FormLabel className="text-cyan-300">Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-2 border-cyan-500 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400">
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-cyan-500 text-white">
                          <SelectItem value="baixa" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Baixa</SelectItem>
                          <SelectItem value="media" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Média</SelectItem>
                          <SelectItem value="alta" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Alta</SelectItem>
                          <SelectItem value="urgente" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-300">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-2 border-cyan-500 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-cyan-500 text-white">
                          <SelectItem value="aguardando" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Aguardando</SelectItem>
                          <SelectItem value="aguardando_orcamento" className="focus:bg-slate-700 focus:text-white hover:bg-slate-700">Aguardando Orçamento</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel className="text-cyan-300">Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o problema relatado..."
                        className="min-h-[120px] bg-slate-700 border-2 border-cyan-500 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-6 border-t border-cyan-500/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/calls")}
                  className="w-32 border-2 border-slate-600 text-cyan-300 hover:bg-slate-700 hover:border-slate-500"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCallMutation.isPending}
                  className="w-48 bg-cyan-600 hover:bg-cyan-700 text-white border-2 border-cyan-500 hover:border-cyan-400"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createCallMutation.isPending ? "Salvando..." : "Salvar Chamado"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}