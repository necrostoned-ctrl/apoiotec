import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Template } from "@shared/schema";

export default function SimpleTemplates() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Template padrão com estrutura simples
  const defaultTemplate = {
    name: "",
    type: "recibo" as const,
    content: `{{empresa_nome}}
{{empresa_endereco}}
{{empresa_telefone}}

CLIENTE:
{{cliente_nome}}
{{cliente_telefone}}

SERVIÇO:
{{descricao}}

VALOR: R$ {{valor}}

Data: {{data}}`,
    headerAlign: "left" as const,
    contentAlign: "left" as const,
    primaryColor: "#007bff",
    fontSize: "14",
  };

  const [formData, setFormData] = useState(defaultTemplate);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao criar template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Template criado com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Template atualizado com sucesso!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar template");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template deletado com sucesso!" });
    },
  });

  const resetForm = () => {
    setFormData(defaultTemplate);
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type as any,
      content: template.content || defaultTemplate.content,
      headerAlign: (template.headerAlign as any) || "left",
      contentAlign: (template.contentAlign as any) || "left",
      primaryColor: template.primaryColor || "#007bff",
      fontSize: template.fontSize || "14",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generatePreview = () => {
    return formData.content
      .replace(/{{empresa_nome}}/g, "APOIOTEC INFORMÁTICA")
      .replace(/{{empresa_endereco}}/g, "Rua Exemplo, 123 - Centro")
      .replace(/{{empresa_telefone}}/g, "(11) 9999-9999")
      .replace(/{{cliente_nome}}/g, "João Silva")
      .replace(/{{cliente_telefone}}/g, "(11) 8888-8888")
      .replace(/{{descricao}}/g, "Manutenção em computador")
      .replace(/{{valor}}/g, "150,00")
      .replace(/{{data}}/g, new Date().toLocaleDateString("pt-BR"));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates Simplificados</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-blue-700">
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Recibo Padrão"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recibo">Recibo</SelectItem>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="nota_servico">Nota de Serviço</SelectItem>
                        <SelectItem value="relatorio">Relatório</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="headerAlign">Alinhamento Cabeçalho</Label>
                      <Select
                        value={formData.headerAlign}
                        onValueChange={(value) => setFormData({ ...formData, headerAlign: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="contentAlign">Alinhamento Conteúdo</Label>
                      <Select
                        value={formData.contentAlign}
                        onValueChange={(value) => setFormData({ ...formData, contentAlign: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="primaryColor">Cor Principal</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                      <Input
                        id="fontSize"
                        type="number"
                        min="10"
                        max="20"
                        value={formData.fontSize}
                        onChange={(e) => setFormData({ ...formData, fontSize: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo do Template</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="Use variáveis como {{empresa_nome}}, {{cliente_nome}}, etc."
                    />
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Variáveis disponíveis:</strong></p>
                    <p>{{empresa_nome}}, {{empresa_endereco}}, {{empresa_telefone}}</p>
                    <p>{{cliente_nome}}, {{cliente_telefone}}</p>
                    <p>{{descricao}}, {{valor}}, {{data}}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <Label>Preview</Label>
                  <div 
                    className="border rounded p-4 bg-background text-black min-h-[400px]"
                    style={{
                      fontSize: `${formData.fontSize}px`,
                      color: formData.primaryColor,
                      textAlign: formData.contentAlign as any,
                    }}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatePreview()}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template: Template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{template.name}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {template.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.content?.substring(0, 100)}...
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum template encontrado</p>
            <p className="text-sm text-gray-400 mt-2">
              Clique em "Novo Template" para começar
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}