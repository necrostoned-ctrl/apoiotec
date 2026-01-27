import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  filename: string;
  title?: string;
}

export function PDFViewer({ isOpen, onClose, pdfBlob, filename, title }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (pdfBlob && isOpen) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    try {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado",
        description: "O arquivo PDF está sendo baixado.",
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        handleRotate();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex flex-col">
      {/* Header com controles */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-80 text-white border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium truncate max-w-[200px] md:max-w-none">
            {title || filename}
          </h2>
        </div>
        
        {/* Controles */}
        <div className="flex items-center space-x-2">
          {/* Controles de zoom e rotação - ocultos no mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-white hover:bg-gray-700"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm px-2 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-white hover:bg-gray-700"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-gray-700"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botão de download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          
          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área do PDF */}
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-2 md:p-4">
        <div 
          className="bg-white shadow-2xl max-w-full max-h-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <iframe
            src={pdfUrl}
            className="w-full h-full min-w-[300px] min-h-[400px] md:min-w-[600px] md:min-h-[800px]"
            style={{
              width: '210mm', // A4 width
              height: '297mm', // A4 height
            }}
            title={filename}
          />
        </div>
      </div>

      {/* Controles mobile (bottom) */}
      <div className="md:hidden flex items-center justify-center space-x-4 p-4 bg-black bg-opacity-80 border-t border-gray-600">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="text-white hover:bg-gray-700"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-white text-sm px-2 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="text-white hover:bg-gray-700"
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          className="text-white hover:bg-gray-700"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Instruções de teclado - apenas desktop */}
      <div className="hidden md:block absolute bottom-4 left-4 text-white text-xs opacity-60">
        <div>ESC: Fechar | +/-: Zoom | R: Girar</div>
      </div>
    </div>
  );
}