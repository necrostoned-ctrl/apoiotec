import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfDataUrl: string;
  filename: string;
}

// Helper function to convert data URL to Blob for sharing
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

export function PDFViewer({ open, onOpenChange, pdfDataUrl, filename }: PDFViewerProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "PDF baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar PDF",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Convert data URL to blob for real file
      const blob = dataUrlToBlob(pdfDataUrl);
      const file = new File([blob], filename, { type: 'application/pdf' });
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: filename.replace('.pdf', ''),
          text: `Compartilhando: ${filename}`,
        });
        
        toast({
          title: "Sucesso",
          description: "PDF compartilhado com sucesso!",
        });
      } else {
        // Fallback: Download instead
        handleDownload();
        toast({
          title: "Informação",
          description: "Seu navegador baixou o arquivo em vez de compartilhar.",
        });
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
        toast({
          title: "Erro",
          description: "Erro ao compartilhar PDF. Tente usar o botão de download.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col bg-slate-900 border-2 border-orange-500 shadow-2xl shadow-orange-500/30">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{filename.replace('.pdf', '')}</DialogTitle>
          <DialogDescription>
            Visualizador de PDF
          </DialogDescription>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <iframe
            src={pdfDataUrl}
            title="PDF Viewer"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 flex gap-3 bg-white">
          <Button 
            variant="default" 
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? 'Compartilhando...' : 'Compartilhar'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
