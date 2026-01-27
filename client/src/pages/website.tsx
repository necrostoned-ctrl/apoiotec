import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ArrowLeft, ArrowRight, Home, RefreshCw, ExternalLink, Lock, AlertTriangle } from "lucide-react";

export default function Website() {
  const [url, setUrl] = useState("https://www.google.com");
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = () => {
    let finalUrl = url;
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    
    setIsLoading(true);
    setHasError(false);
    setCurrentUrl(finalUrl);
    setUrl(finalUrl);
  };

  const handleHome = () => {
    const homeUrl = "https://www.google.com";
    setUrl(homeUrl);
    setCurrentUrl(homeUrl);
    setIsLoading(true);
    setHasError(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl + "?t=" + Date.now();
    }
  };

  const handleBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        console.log("Cannot navigate back due to security restrictions");
      }
    }
  };

  const handleForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
      } catch (e) {
        console.log("Cannot navigate forward due to security restrictions");
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const quickLinks = [
    { name: "Google", url: "https://www.google.com", secure: true },
    { name: "YouTube", url: "https://www.youtube.com", secure: true },
    { name: "Gmail", url: "https://mail.google.com", secure: true },
    { name: "Facebook", url: "https://www.facebook.com", secure: true },
    { name: "Twitter", url: "https://www.twitter.com", secure: true },
    { name: "LinkedIn", url: "https://www.linkedin.com", secure: true },
    { name: "WhatsApp Web", url: "https://web.whatsapp.com", secure: true },
    { name: "Mercado Livre", url: "https://www.mercadolivre.com.br", secure: true },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-cyan-400" />
        <h1 className="text-3xl font-bold">Navegador Web</h1>
      </div>

      {/* Navigation Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleForward}
              disabled={isLoading}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleHome}
              disabled={isLoading}
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {currentUrl.startsWith('https://') ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Digite a URL..."
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleNavigate}
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : 'Ir'}
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              disabled={isLoading}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Web Content Frame */}
          <div className="border rounded-b-lg overflow-hidden bg-white relative">
            {hasError ? (
              <div className="flex items-center justify-center h-[600px] bg-slate-900">
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-300">
                      Não foi possível carregar a página
                    </h3>
                    <p className="text-cyan-100 mt-2">
                      Verifique a URL ou tente novamente
                    </p>
                  </div>
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-400" />
                      <p className="text-cyan-100">Carregando...</p>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="w-full h-[600px] border-0"
                  title="Web Browser"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads"
                  loading="lazy"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                onClick={() => {
                  setUrl(link.url);
                  setCurrentUrl(link.url);
                  setIsLoading(true);
                  setHasError(false);
                }}
                className="h-auto p-3 text-left justify-start"
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {link.secure && (
                    <Lock className="h-3 w-3 text-green-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{link.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {link.url.replace('https://', '').replace('www.', '')}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Aviso de Segurança</p>
              <p>
                Este navegador possui limitações de segurança. Alguns sites podem não funcionar completamente. 
                Para uma experiência completa, utilize o botão "Abrir Externamente" para acessar sites em uma nova aba.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}