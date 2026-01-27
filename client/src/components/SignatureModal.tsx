import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download
} from "lucide-react";

interface DigitalCertificate {
  id: number;
  name: string;
  subjectName: string;
  cnpj: string | null;
  status: 'active' | 'warning' | 'expired';
  daysUntilExpiry?: number;
}

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  documentType: 'quotation' | 'service_note' | 'receipt';
  documentId: number;
  documentName: string;
  userId?: number;
  onDownloadOriginal: () => void;
  onSignSuccess?: (signedPdfBase64: string) => void;
}

export function SignatureModal({
  isOpen,
  onClose,
  pdfBlob,
  documentType,
  documentId,
  documentName,
  userId = 1,
  onDownloadOriginal,
  onSignSuccess
}: SignatureModalProps) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [step, setStep] = useState<'ask' | 'password'>('ask');

  const { data: certificates = [], isLoading } = useQuery<DigitalCertificate[]>({
    queryKey: ["/api/digital-certificates"],
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setStep('ask');
      setPassword("");
      setSelectedCertificate(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (certificates.length > 0 && !selectedCertificate) {
      const activeCert = certificates.find(c => c.status === 'active' || c.status === 'warning');
      if (activeCert) {
        setSelectedCertificate(activeCert);
      }
    }
  }, [certificates, selectedCertificate]);

  const signMutation = useMutation({
    mutationFn: async () => {
      if (!pdfBlob || !selectedCertificate) {
        throw new Error("PDF ou certificado não disponível");
      }

      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const response = await fetch('/api/digital-signature/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          certificateId: selectedCertificate.id,
          password,
          pdfBase64: base64,
          documentType,
          documentId,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao assinar documento');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Sucesso", description: "Documento assinado com sucesso!" });
      
      // Passar o PDF assinado para o callback antes de fechar
      if (onSignSuccess && data.signedPdfBase64) {
        onSignSuccess(data.signedPdfBase64);
      }
      
      // Fechar o modal de assinatura - o onClose vai abrir o PDFViewer
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao assinar", 
        description: error.message || "Erro ao assinar documento",
        variant: "destructive"
      });
    }
  });

  const handleDownloadWithoutSign = () => {
    onDownloadOriginal();
    onClose();
  };

  const handleSign = () => {
    if (!password) {
      toast({ 
        title: "Atenção", 
        description: "Digite a senha do certificado",
        variant: "destructive"
      });
      return;
    }
    signMutation.mutate();
  };

  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'quotation': return 'Orçamento';
      case 'service_note': return 'Nota de Serviço';
      case 'receipt': return 'Recibo';
      default: return 'Documento';
    }
  };

  const hasCertificates = certificates.length > 0;
  const hasActiveCertificate = certificates.some(c => c.status !== 'expired');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {step === 'ask' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Assinatura Digital
              </DialogTitle>
              <DialogDescription>
                Deseja assinar digitalmente este {getDocumentTypeName().toLowerCase()}?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm font-medium">{getDocumentTypeName()} #{documentId}</p>
                <p className="text-xs text-muted-foreground">{documentName}</p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              ) : !hasCertificates ? (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Nenhum certificado digital cadastrado. Vá em "Certificados Digitais" para adicionar um.
                  </AlertDescription>
                </Alert>
              ) : !hasActiveCertificate ? (
                <Alert variant="destructive">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>
                    Todos os certificados estão expirados. Renove seu certificado para assinar documentos.
                  </AlertDescription>
                </Alert>
              ) : selectedCertificate && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{selectedCertificate.name}</span>
                    <Badge variant={selectedCertificate.status === 'warning' ? 'default' : 'secondary'} className={selectedCertificate.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}>
                      {selectedCertificate.status === 'warning' ? (
                        <><AlertTriangle className="w-3 h-3 mr-1" /> Expira em {selectedCertificate.daysUntilExpiry} dias</>
                      ) : (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Ativo</>
                      )}
                    </Badge>
                  </div>
                  {selectedCertificate.cnpj && (
                    <p className="text-xs text-muted-foreground">CNPJ: {selectedCertificate.cnpj}</p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadWithoutSign}
                className="w-full sm:w-auto"
                data-testid="button-download-without-sign"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar sem Assinar
              </Button>
              <Button 
                onClick={() => setStep('password')}
                disabled={!hasActiveCertificate || isLoading}
                className="w-full sm:w-auto"
                data-testid="button-sign-document"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sim, Assinar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                Senha do Certificado
              </DialogTitle>
              <DialogDescription>
                Digite a senha do certificado "{selectedCertificate?.name}" para assinar o documento.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="cert-password">Senha do Certificado</Label>
                <div className="relative mt-1">
                  <Input
                    id="cert-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSign()}
                    data-testid="input-signature-password"
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
                  Máximo 2 tentativas erradas. Após isso, aguarde 3 minutos.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('ask')}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSign}
                disabled={signMutation.isPending || !password}
                className="w-full sm:w-auto"
                data-testid="button-confirm-signature"
              >
                {signMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Assinando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Assinar e Baixar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
