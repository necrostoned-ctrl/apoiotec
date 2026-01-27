import { useState } from "react";
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
import { NextStepsModal } from "@/components/next-steps-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCallSchema, insertClientSchema, type Client } from "@shared/schema";
import { useLocation } from "wouter";
import { Save, FileText, Plus } from "lucide-react";
import { z } from "zod";

const formSchema = insertCallSchema.extend({
  clientId: z.coerce.number(),
});

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Nome é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;
type ClientFormData = z.infer<typeof clientFormSchema>;

export default function NewCall() {
  const [, setLocation] = useLocation();
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
      const response = await apiRequest("POST", "/api/calls", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowNextSteps(true);
      toast({
        title: "Sucesso",
        description: "Chamado criado com sucesso!",
      });
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
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (newClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      form.setValue("clientId", newClient.id);
      setShowNewClientDialog(false);
      clientForm.reset();
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

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);
    console.log("Form errors:", form.formState.errors);
    createCallMutation.mutate(data);
  };

  const onClientSubmit = (data: ClientFormData) => {
    createClientMutation.mutate(data);
  };

  const handleNextStep = (step: string) => {
    switch (step) {
      case "services":
        setLocation("/services");
        break;
      case "quotes":
        setLocation("/quotes");
        break;
      case "invoice":
        toast({
          title: "Em desenvolvimento",
          description: "Funcionalidade de nota fiscal em breve!",
        });
        break;
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-cyan-300 mb-2">Novo Chamado</h2>
        <p className="text-cyan-100">Registre uma nova solicitação de serviço</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cliente */}
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Cliente</FormLabel>
                        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Novo Cliente
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Novo Cliente</DialogTitle>
                              <DialogDescription>
                                Crie um novo cliente para continuar com o chamado.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...clientForm}>
                              <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                                <FormField
                                  control={clientForm.control}
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
                                  control={clientForm.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Telefone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} onChange={field.onChange} />
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
                                        <Input placeholder="cliente@email.com" {...field} value={field.value || ""} onChange={field.onChange} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex gap-2 justify-end">
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
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          disabled={clientsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                              >
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Novo Cliente</DialogTitle>
                              <DialogDescription>
                                Crie um novo cliente para continuar com o chamado.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...clientForm}>
                              <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                                <FormField
                                  control={clientForm.control}
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
                                  control={clientForm.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Telefone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} onChange={field.onChange} />
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
                                        <Input placeholder="cliente@email.com" {...field} value={field.value || ""} onChange={field.onChange} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end gap-2">
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
                        <Input
                          placeholder="Ex: Notebook Dell Inspiron 15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de Serviço */}
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
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
              </div>

              {/* Descrição do Problema */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Descreva detalhadamente o problema relatado pelo cliente..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações */}
              <FormField
                control={form.control}
                name="internalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Observações internas, diagnóstico inicial..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={createCallMutation.isPending}
                  onClick={() => {
                    console.log("Button clicked");
                    console.log("Form valid:", form.formState.isValid);
                    console.log("Form errors:", form.formState.errors);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createCallMutation.isPending ? "Salvando..." : "Salvar Chamado"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    // Save as draft logic here
                    toast({
                      title: "Em desenvolvimento",
                      description: "Funcionalidade de rascunho em breve!",
                    });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Salvar como Rascunho
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <NextStepsModal
        open={showNextSteps}
        onOpenChange={setShowNextSteps}
        onSelectStep={handleNextStep}
      />
    </div>
  );
}
