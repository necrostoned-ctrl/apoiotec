import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Evento padrão de instalação PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Se for iOS, mostrar após 2 segundos
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg shadow-xl p-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
            Instalar Apoiotec
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isIOS
              ? 'Toque em "Compartilhar" → "Adicionar à Tela de Início"'
              : 'Instale como aplicativo na sua tela inicial'}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!isIOS && deferredPrompt && (
        <Button
          onClick={handleInstall}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Instalar Agora
        </Button>
      )}

      {isIOS && (
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
          📱 Abra este site no Safari e procure pela opção de compartilhar!
        </p>
      )}
    </div>
  );
}
