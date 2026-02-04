import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClientSearch } from "@/components/ClientSearch";
import { Plus, Calendar, Trash2, Edit, Check, AlertCircle, Search, Eye } from "lucide-react";
import { insertPreventiveMaintenanceSchema, type PreventiveMaintenanceWithClient, type Client } from "@shared/schema";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const maintenanceFormSchema = insertPreventiveMaintenanceSchema.extend({
  scheduledDate: z.string().or(z.instanceof(Date)),
});
type FormData = z.infer<typeof maintenanceFormSchema>;

export default function PreventiveMaintenance({ currentUser }: { currentUser?: any }) {
  const loggedUser = currentUser || JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<PreventiveMaintenanceWithClient | null>(null);
  const [viewingMaintenance, setViewingMaintenance] = useState<PreventiveMaintenanceWithClient | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: maintenances = [], isLoading } = useQuery<PreventiveMaintenanceWithClient[]>({
    queryKey: ["/api/preventive-maintenance"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<any>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      clientId: 0,
      description: "",
      equipmentType: "",
      frequency: "mensal",
      scheduledDate: new Date().toISOString().split("T")[0],
      status: "pendente",
      userId: loggedUser?.id || 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/preventive-maintenance", {
        ...data,
        userId: loggedUser?.id || 1,
        scheduledDate: new Date(data.scheduledDate as any).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-maintenance"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Sucesso", description: "Manutenção agendada!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiRequest("PATCH", `/api/preventive-maintenance/${id}`, {
        ...data,
        scheduledDate: new Date(data.scheduledDate as any).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-maintenance"] });
      setIsDialogOpen(false);
      setEditingMaintenance(null);
      form.reset();
      toast({ title: "Sucesso", description: "Manutenção atualizada!" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/preventive-maintenance/${id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-maintenance"] });
      toast({ title: "Sucesso", description: "Manutenção marcada como concluída!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/preventive-maintenance/${id}`);
      if (!response.ok) throw new Error("Erro ao deletar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-maintenance"] });
      toast({ title: "Sucesso", description: "Manutenção deletada!" });
    },
  });

  const filteredMaintenances = statusFilter
    ? maintenances.filter((m) => m.status === statusFilter)
    : maintenances;

  const onSubmit = (data: FormData) => {
    if (editingMaintenance) {
      updateMutation.mutate({ id: editingMaintenance.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6 pb-32">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">Manutenção Preventiva</h2>
          <p className="text-gray-400">Gerencie agendamentos de manutenção preventiva</p>
        </div>
        <Button 
          onClick={() => { setEditingMaintenance(null); form.reset(); setIsDialogOpen(true); }}
          className="bg-primary hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agendar Manutenção
        </Button>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["pendente", "concluido", "cancelado"].map((status) => {
              const count = maintenances.filter((m) => m.status === status).length;
              const isActive = statusFilter === status;
              return (
                <Card
                  key={status}
                  className={`cursor-pointer transition-all border-l-4 ${
                    isActive 
                      ? "border-l-blue-600 bg-blue-50 dark:bg-blue-950 shadow-md" 
                      : "border-l-gray-300 dark:border-l-gray-600 hover:shadow-md"
                  } bg-background dark:bg-slate-800`}
                  onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
                >
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide capitalize">{status}</p>
                    <p className="text-3xl font-bold text-primary dark:text-blue-400 mt-2">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
        )}
      </Card>

      {isLoading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : filteredMaintenances.length === 0 ? (
        <Card className="bg-background dark:bg-slate-800 border-0">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Nenhuma manutenção encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenances
            .sort(
              (a, b) =>
                new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
            )
            .map((maintenance) => (
              <Card key={maintenance.id} className="bg-background dark:bg-slate-800 border-4 border-blue-500 dark:border-blue-400 hover:shadow-xl hover:shadow-blue-500/50 shadow-lg dark:shadow-blue-500/20 transition-shadow flex flex-col h-full">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="p-4 space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{maintenance.title}</CardTitle>
                        <Badge className={`${getStatusColor(maintenance.status)} mt-2`}>
                          {getStatusLabel(maintenance.status)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cliente</p>
                      <p className="text-sm text-gray-900 dark:text-white">{maintenance.client?.name || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Data</p>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(maintenance.scheduledDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Frequência</p>
                        <p className="text-sm text-gray-900 dark:text-white">{maintenance.frequency}</p>
                      </div>
                    </div>
                    {maintenance.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Descrição</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{maintenance.description}</p>
                      </div>
                    )}
                    {maintenance.equipmentType && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Equipamento</p>
                        <p className="text-sm text-gray-900 dark:text-white">{maintenance.equipmentType}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pt-3 border-t border-gray-200 dark:border-slate-700 mt-auto">
                    <div className="grid grid-cols-4 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingMaintenance(maintenance);
                          setIsViewDialogOpen(true);
                        }}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1"
                        title="Visualizar Detalhes"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMaintenance(maintenance);
                          form.reset({
                            title: maintenance.title,
                            clientId: maintenance.clientId,
                            description: maintenance.description || "",
                            equipmentType: maintenance.equipmentType || "",
                            frequency: maintenance.frequency,
                            scheduledDate: new Date(maintenance.scheduledDate).toISOString().split("T")[0],
                            status: maintenance.status,
                            userId: maintenance.userId,
                          });
                          setIsDialogOpen(true);
                        }}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => completeMutation.mutate(maintenance.id)}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Marcar como Concluído"
                        disabled={maintenance.status !== "pendente"}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Deletar?")) {
                            deleteMutation.mutate(maintenance.id);
                          }
                        }}
                        className="h-8 text-xs flex flex-col items-center justify-center p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Deletar"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-teal-500 shadow-2xl shadow-teal-500/30">
          <DialogHeader>
            <DialogTitle>
              {editingMaintenance ? "Editar Manutenção" : "Agendar Manutenção"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <ClientSearch
                        value={field.value}
                        onSelect={(clientId) => field.onChange(clientId)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Equipamento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Agendada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
                      <div className="flex gap-3 justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-gray-700 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-blue-700 text-white">
                  {editingMaintenance ? "Atualizar" : "Agendar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewingMaintenance?.title}</DialogTitle>
          </DialogHeader>
          {viewingMaintenance && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col gap-4">
                <Badge className={`${getStatusColor(viewingMaintenance.status)} w-fit`}>
                  {getStatusLabel(viewingMaintenance.status)}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Cliente</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{viewingMaintenance.client?.name || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Data Agendada</p>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-gray-900 dark:text-white font-medium">{formatDate(viewingMaintenance.scheduledDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Frequência</p>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="text-gray-900 dark:text-white font-medium capitalize">{viewingMaintenance.frequency}</p>
                  </div>
                </div>
              </div>

              {viewingMaintenance.equipmentType && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Tipo de Equipamento</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-primary">
                    <p className="text-gray-900 dark:text-white">{viewingMaintenance.equipmentType}</p>
                  </div>
                </div>
              )}

              {viewingMaintenance.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Descrição</p>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border-l-4 border-green-600">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">{viewingMaintenance.description}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)} 
                  className="text-gray-700 dark:text-gray-300"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
