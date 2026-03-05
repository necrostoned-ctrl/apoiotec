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

  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: undefined as any,
      equipment: "",
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
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Novo Chamado</h1>
          <p className="text-gray-400">Registre uma nova solicitação de serviço técnico</p>
        </div>
      </div>

      <Card className="max-w-4xl bg-background dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary dark:text-blue-400" />
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
                        <FormLabel>Cliente *</FormLabel>
                        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-medium"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Novo Cliente
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md bg-background dark:bg-slate-800 max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Novo Cliente</DialogTitle>
                              <DialogDescription>
                                Preencha as informações do cliente. O nome é obrigatório.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...clientForm}>
                              <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-5 py-4">
                                <FormField
                                  control={clientForm.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nome do Cliente *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ex: João Silva ou Empresa LTDA" {...field} autoFocus />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={clientForm.control}
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
                                  control={clientForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="cliente@email.com" {...field} value={field.value || ""} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex gap-3 justify-end pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowNewClientDialog(false);
                                      setTimeout(() => clientForm.reset(), 50);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={createClientMutation.isPending}
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
                          placeholder="Buscar cliente existente..."
                          allowEmpty={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Equipamento */}
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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data do Chamado */}
                <FormField
                  control={form.control}
                  name="callDateStr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora do Chamado</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição e Observações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição / Serviço a realizar</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Cliente relata que o equipamento não liga..."
                          className="min-h-[140px] resize-none"
                          {...field}
                        />
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
                      <FormLabel>Observações Internas (Uso Técnico)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Verificar também o cabo da fonte. Trazer chave torque..."
                          className="min-h-[140px] resize-none bg-blue-50/50 dark:bg-blue-900/10"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/calls")}
                  className="w-32"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCallMutation.isPending}
                  className="w-48 bg-primary hover:bg-primary/90 text-primary-foreground"
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