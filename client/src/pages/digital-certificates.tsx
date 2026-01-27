import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Upload, 
  Trash2, 
  Key, 
  Calendar, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DigitalCertificate {
  id: number;
  name: string;
  subjectName: string;
  issuerName: string;
  serialNumber: string;
  cnpj: string | null;
  certificatePath: string;
  expiryDate: string;
  status: 'active' | 'warning' | 'expired';
  daysUntilExpiry?: number;
  createdAt: string;
}

interface SignatureAuditLog {
  id: number;
  certificate_id: number;
  document_type: string;
  document_id: number;
  user_id: number;
  signed_at: string;
  status: string;
  error_message: string | null;
  certificate_name: string;
}

export default function DigitalCertificatesPage() {
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: certificates = [], isLoading } = useQuery<DigitalCertificate[]>({
    queryKey: ["/api/digital-certificates"],
  });

  const { data: auditLogs = [] } = useQuery<SignatureAuditLog[]>({
    queryKey: ["/api/signature-audit-log"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/digital-certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/digital-certificates"] });
      toast({ title: "Sucesso", description: "Certificado removido com sucesso" });
      setShowDeleteConfirm(false);
      setSelectedCertificate(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao remover certificado", variant: "destructive" });
    }
  });

  const testMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const response = await apiRequest("POST", `/api/digital-certificates/${id}/test`, { password });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({ title: "Sucesso", description: "Certificado validado com sucesso!" });
      } else {
        toast({ title: "Erro", description: data.error || "Senha incorreta", variant: "destructive" });
      }
      setShowTestDialog(false);
      setTestPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Erro ao testar certificado", variant: "destructive" });
    }
  });

  const handleUpload = async () => {
    if (!uploadFile || !uploadPassword) {
      toast({ title: "Atenção", description: "Selecione o arquivo e informe a senha", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('certificate', uploadFile);
      formData.append('password', uploadPassword);
      if (uploadName) formData.append('name', uploadName);

      const response = await fetch('/api/digital-certificates/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      toast({ title: "Sucesso", description: "Certificado adicionado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/digital-certificates"] });
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadPassword("");
      setUploadName("");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao fazer upload do certificado", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string, daysUntilExpiry?: number) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expira em {daysUntilExpiry} dias
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'quotation': return 'Orçamento';
      case 'service_note': return 'Nota de Serviço';
      case 'receipt': return 'Recibo';
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            Certificados Digitais
          </h1>
          <p className="text-muted-foreground">
            Gerencie certificados A1 para assinatura digital de documentos
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} data-testid="button-add-certificate">
          <Upload className="w-4 h-4 mr-2" />
          Adicionar Certificado
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum certificado cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione um certificado digital A1 (.pfx ou .p12) para assinar documentos
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Primeiro Certificado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className={cert.status === 'expired' ? 'border-red-500' : cert.status === 'warning' ? 'border-yellow-500' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    {cert.name}
                  </CardTitle>
                  {getStatusBadge(cert.status, cert.daysUntilExpiry)}
                </div>
                <CardDescription>{cert.subjectName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Autoridade
                    </p>
                    <p className="font-medium">{cert.issuerName || 'N/A'}</p>
                  </div>
                  {cert.cnpj && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        CNPJ
                      </p>
                      <p className="font-medium">{cert.cnpj}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Válido até
                    </p>
                    <p className="font-medium">
                      {format(new Date(cert.expiryDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Dias restantes
                    </p>
                    <p className={`font-medium ${cert.daysUntilExpiry && cert.daysUntilExpiry <= 30 ? 'text-yellow-500' : ''} ${cert.daysUntilExpiry && cert.daysUntilExpiry <= 0 ? 'text-red-500' : ''}`}>
                      {cert.daysUntilExpiry !== undefined ? cert.daysUntilExpiry : 'N/A'} dias
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCertificate(cert);
                      setShowTestDialog(true);
                    }}
                    data-testid={`button-test-certificate-${cert.id}`}
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Testar Certificado
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedCertificate(cert);
                      setShowDeleteConfirm(true);
                    }}
                    data-testid={`button-delete-certificate-${cert.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Histórico de Assinaturas
            </CardTitle>
            <CardDescription>Últimas assinaturas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {getDocumentTypeName(log.document_type)} #{log.document_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.signed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status === 'success' ? 'Assinado' : 'Falha'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Certificado Digital</DialogTitle>
            <DialogDescription>
              Faça upload do seu certificado A1 (.pfx ou .p12)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cert-name">Nome do Certificado (opcional)</Label>
              <Input
                id="cert-name"
                placeholder="Ex: Certificado Apoiotec"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                data-testid="input-certificate-name"
              />
            </div>
            <div>
              <Label htmlFor="cert-file">Arquivo do Certificado</Label>
              <Input
                id="cert-file"
                type="file"
                accept=".pfx,.p12"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                data-testid="input-certificate-file"
              />
            </div>
            <div>
              <Label htmlFor="cert-password">Senha do Certificado</Label>
              <div className="relative">
                <Input
                  id="cert-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha do certificado"
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  data-testid="input-certificate-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                A senha não será armazenada no sistema
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading} data-testid="button-confirm-upload">
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Certificado</DialogTitle>
            <DialogDescription>
              Digite a senha para validar o certificado "{selectedCertificate?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-password">Senha do Certificado</Label>
              <div className="relative">
                <Input
                  id="test-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  data-testid="input-test-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedCertificate && testMutation.mutate({ id: selectedCertificate.id, password: testPassword })}
              disabled={testMutation.isPending}
              data-testid="button-confirm-test"
            >
              {testMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Testar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Certificado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o certificado "{selectedCertificate?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedCertificate && deleteMutation.mutate(selectedCertificate.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
