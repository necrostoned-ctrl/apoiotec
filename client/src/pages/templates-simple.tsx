import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import type { Template } from "@shared/schema";

const templateFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  company_name: z.string().min(1, "Nome da empresa é obrigatório"),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.string().optional(),
  primary_color: z.string().optional(),
  font_size: z.string().optional()
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

export default function Templates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"]
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      type: "",
      company_name: "APOIOTEC INFORMÁTICA",
      company_address: "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
      company_phone: "(11) 99999-9999",
      company_email: "contato@apoiotec.com.br",
      primary_color: "#0066cc",
      font_size: "14"
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => apiRequest("/api/templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar template", variant: "destructive" });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      console.log("=== MUTATION UPDATE ===");
      console.log("ID:", id);
      console.log("Data:", data);
      return apiRequest(`/api/templates/${id}`, "PUT", data);
    },
    onSuccess: (result) => {
      console.log("Update successful:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      toast({ 
        title: "Erro", 
        description: `Erro ao atualizar template: ${error.message || 'Erro desconhecido'}`, 
        variant: "destructive" 
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/templates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir template", variant: "destructive" });
    }
  });

  const handleSubmit = (data: TemplateFormData) => {
    console.log("=== SUBMIT FORM ===");
    console.log("Form data:", data);
    console.log("Editing template:", editingTemplate);
    
    // Converter nomes dos campos para o formato do schema
    const templateData: any = {
      name: data.name,
      type: data.type,
      companyName: data.company_name,
      companyAddress: data.company_address,
      companyPhone: data.company_phone,
      companyEmail: data.company_email,
      primaryColor: data.primary_color,
      fontSize: data.font_size
    };
    
    console.log("Template data converted:", templateData);
    
    if (editingTemplate) {
      console.log("Atualizando template ID:", editingTemplate.id);
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      console.log("Criando novo template");
      createTemplateMutation.mutate(templateData);
    }
  };

  const handleEdit = (template: Template) => {
    console.log("=== EDITANDO TEMPLATE ===");
    console.log("Template selecionado:", template);
    
    setEditingTemplate(template);
    const formData = {
      name: template.name,
      type: template.type,
      company_name: template.companyName || "APOIOTEC INFORMÁTICA",
      company_address: template.companyAddress || "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
      company_phone: template.companyPhone || "(11) 99999-9999",
      company_email: template.companyEmail || "contato@apoiotec.com.br",
      primary_color: template.primaryColor || "#0066cc",
      font_size: template.fontSize || "14"
    };
    
    console.log("Dados do form:", formData);
    form.reset(formData);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Templates</h1>
        </div>
        <p>Carregando templates...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Templates</h1>
        </div>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize">{template.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Empresa:</strong> {template.companyName || "Não informado"}</p>
                  <p><strong>Telefone:</strong> {template.companyPhone || "Não informado"}</p>
                </div>
                <div>
                  <p><strong>E-mail:</strong> {template.companyEmail || "Não informado"}</p>
                  <p><strong>Cor primária:</strong> 
                    <span 
                      className="inline-block w-4 h-4 rounded ml-2" 
                      style={{ backgroundColor: template.primaryColor || "#0066cc" }}
                    ></span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-gray-500 mb-4">Crie seu primeiro template para personalizar os documentos</p>
              <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Recibo Padrão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="recibo">Recibo</option>
                        <option value="orcamento">Orçamento</option>
                        <option value="nota_servico">Nota de Serviço</option>
                        <option value="relatorio">Relatório</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="font_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho da Fonte</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}