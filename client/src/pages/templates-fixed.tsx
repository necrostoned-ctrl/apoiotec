import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Edit, Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Template } from "@shared/schema";

export default function Templates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    companyName: "APOIOTEC INFORMÁTICA",
    companyAddress: "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
    companyPhone: "(11) 99999-9999",
    companyEmail: "contato@apoiotec.com.br",
    primaryColor: "#0066cc",
    fontSize: "14"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"]
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("Creating template:", data);
      return apiRequest("POST", "/api/templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating template:", error);
      toast({ title: "Erro", description: `Erro ao criar template: ${error.message}`, variant: "destructive" });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      console.log("=== UPDATING TEMPLATE ===");
      console.log("ID:", id);
      console.log("Data:", data);
      return apiRequest("PUT", `/api/templates/${id}`, data);
    },
    onSuccess: (result) => {
      console.log("Update successful:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error updating template:", error);
      toast({ 
        title: "Erro", 
        description: `Erro ao atualizar template: ${error.message || 'Erro desconhecido'}`, 
        variant: "destructive" 
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Sucesso", description: "Template excluído com sucesso!" });
    },
    onError: (error: any) => {
      console.error("Error deleting template:", error);
      toast({ title: "Erro", description: "Erro ao excluir template", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      companyName: "APOIOTEC INFORMÁTICA",
      companyAddress: "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
      companyPhone: "(11) 99999-9999",
      companyEmail: "contato@apoiotec.com.br",
      primaryColor: "#0066cc",
      fontSize: "14"
    });
  };

  const handleEdit = (template: Template) => {
    console.log("=== EDITING TEMPLATE ===");
    console.log("Template:", template);
    
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      companyName: template.companyName || "APOIOTEC INFORMÁTICA",
      companyAddress: template.companyAddress || "Rua da Tecnologia, 123 - Centro - São Paulo/SP",
      companyPhone: template.companyPhone || "(11) 99999-9999",
      companyEmail: template.companyEmail || "contato@apoiotec.com.br",
      primaryColor: template.primaryColor || "#0066cc",
      fontSize: template.fontSize || "14"
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT ===");
    console.log("Form data:", formData);
    console.log("Editing template:", editingTemplate);

    if (editingTemplate) {
      console.log("Updating template ID:", editingTemplate.id);
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      console.log("Creating new template");
      createTemplateMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando templates...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
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
              <div className="text-sm space-y-2">
                <p><strong>Empresa:</strong> {template.companyName}</p>
                <p><strong>Telefone:</strong> {template.companyPhone}</p>
                <p><strong>Email:</strong> {template.companyEmail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="recibo">Recibo</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="nota_servico">Nota de Serviço</option>
                  <option value="relatorio">Relatório</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Nome da Empresa</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Endereço</label>
              <Input
                value={formData.companyAddress}
                onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cor Principal</label>
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tamanho da Fonte</label>
                <Input
                  value={formData.fontSize}
                  onChange={(e) => setFormData({...formData, fontSize: e.target.value})}
                  placeholder="14"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTemplate ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}