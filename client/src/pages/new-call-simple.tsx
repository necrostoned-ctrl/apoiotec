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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCallSchema, type Client } from "@shared/schema";
import { useLocation } from "wouter";
import { Save } from "lucide-react";
import { z } from "zod";

const formSchema = insertCallSchema.extend({
  clientId: z.coerce.number(),
}).omit({
  serviceType: true,
  equipment: true,
});

type FormData = z.infer<typeof formSchema>;

export default function NewCallSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolution: "",
      priority: "media",
      description: "",
      internalNotes: "",
      status: "aguardando",
      progress: 0,
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const callData = {
        ...data,
        equipment: "", // Campo vazio, será preenchido na conversão
        serviceType: "geral", // Valor padrão
      };
      const response = await apiRequest("POST", "/api/calls", callData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Chamado criado com sucesso!",
      });
      setLocation("/services");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar chamado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitting form data:", data);
    createCallMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-cyan-300 mb-2">Novo Chamado</h2>
        <p className="text-cyan-100">Registre uma nova solicitação de serviço</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informações do Chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Cliente */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

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



              {/* Botão de Salvar */}
              <div className="flex justify-center pt-6 pb-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={createCallMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
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