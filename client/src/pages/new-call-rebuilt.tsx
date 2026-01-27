import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ClientSearch } from "@/components/ClientSearch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCallSchema, type Client } from "@shared/schema";
import { z } from "zod";
import { Phone, Plus, Save, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const callFormSchema = insertCallSchema.extend({
  clientId: z.coerce.number().min(1, "Cliente é obrigatório"),
  equipment: z.string().optional(),
  serviceType: z.string().optional(),
  callDate: z.date().optional(),
});

type CallFormData = z.infer<typeof callFormSchema>;

export default function NewCallRebuilt() {
  const [, setLocation] = useLocation();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Obter usuário atual logado
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const form = useForm<CallFormData>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      equipment: "",
      serviceType: "",
      description: "",
      priority: "media",
      status: "aguardando",
    },
  });

  // Form for new client
  const newClientForm = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: CallFormData) => {
      console.log("=== CRIANDO CHAMADO ===");
      console.log("Dados enviados:", data);
      console.log("Usuário atual:", currentUser);
      
      // Adicionar userId do usuário atual
      const enhancedData = {
        ...data,
        userId: currentUser?.id || 1
      };
      
      console.log("Dados com userId:", enhancedData);
      
      const response = await apiRequest("POST", "/api/calls", enhancedData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || "Erro ao criar chamado");
      }
      return response.json();
    },
    onSuccess: (newCall) => {
      console.log("Chamado criado:", newCall);
      // Limpar completamente o cache e forçar nova busca
      queryClient.clear();
      queryClient.refetchQueries({ queryKey: ["/api/calls"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso!",
        description: "Chamado criado com sucesso!",
      });
      form.reset();
      // Aguardar um pouco antes de redirecionar para garantir que os dados sejam recarregados
      setTimeout(() => {
        setLocation("/calls");
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Erro ao criar chamado:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/clients", data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || "Erro ao criar cliente");
      }
      return response.json();
    },
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso!",
        description: `Cliente ${newClient.name} criado com sucesso!`,
      });
      // Select the new client automatically
      form.setValue("clientId", newClient.id);
      newClientForm.reset();
      setShowNewClientDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cliente. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CallFormData) => {
    createCallMutation.mutate(data);
  };

  const onCreateClient = (data: any) => {
    createClientMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/calls")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Chamado</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Dados do Chamado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Cliente - Campo Principal */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Cliente *</FormLabel>
                    <div className="space-y-3">
                      <FormControl>
                        <ClientSearch
                          value={field.value}
                          onSelect={(clientId, client) => {
                            console.log('Cliente selecionado:', clientId, client);
                            field.onChange(clientId || undefined);
                          }}
                          placeholder="Digite para buscar um cliente..."
                          allowEmpty={false}
                        />
                      </FormControl>
                      
                      {/* Botão para criar novo cliente */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewClientDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Novo Cliente
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data do Chamado */}
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
                              <span>Deixe vazio para usar data atual</span>
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
                    <div className="text-sm text-muted-foreground">
                      Se não informar, será usado a data atual automaticamente
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhadamente o problema reportado pelo cliente..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prioridade */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
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

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/calls")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCallMutation.isPending}
                  className="flex-1 flex items-center gap-2"
                >
                  {createCallMutation.isPending ? (
                    "Criando..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Criar Chamado
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog para criar novo cliente */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente
            </DialogDescription>
          </DialogHeader>
          <Form {...newClientForm}>
            <form onSubmit={newClientForm.handleSubmit(onCreateClient)} className="space-y-4">
              <FormField
                control={newClientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newClientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(84) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newClientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="cliente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewClientDialog(false)}
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
  );
}