// Função para buscar configurações completas do sistema
export async function getFontSettings(): Promise<{ 
  fontSize: string; 
  pdfFontSize: string;
  fontFamily: string;
  companyName: string;
  pdfSubtitle?: string;
  pdfPhone1?: string;
  pdfPhone2?: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
}> {
  try {
    // Tentar buscar do localStorage primeiro (mais rápido)
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Normalizar fontSize usando parseFloat para remover TODAS as unidades
      const fontSizeNum = parseFloat(String(settings.fontSize || '22'));
      const fontSize = isNaN(fontSizeNum) ? '22' : fontSizeNum.toString();
      // Normalizar pdfFontSize
      const pdfFontSizeNum = parseFloat(String(settings.pdfFontSize || '10'));
      const pdfFontSize = isNaN(pdfFontSizeNum) ? '10' : pdfFontSizeNum.toString();
      return {
        fontSize,
        pdfFontSize,
        fontFamily: settings.fontFamily || 'system',
        companyName: settings.companyName || 'Apoiotec Informática',
        pdfSubtitle: settings.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática',
        pdfPhone1: settings.pdfPhone1 || '84988288543',
        pdfPhone2: settings.pdfPhone2 || '84988363828',
        cnpj: settings.cnpj || '15.292.813.0001-70',
        address: settings.address || 'Rua Exemplo, 123 - Centro',
        phone: settings.phone || '(11) 1234-5678',
        email: settings.email || 'contato@apoiotec.com',
        primaryColor: settings.primaryColor || '#2563eb',
        secondaryColor: settings.secondaryColor || '#059669',
        footerText: settings.footerText || 'Documento emitido pelo sistema Apoiotec',
      };
    }

    // Se não houver no localStorage, buscar do backend
    const response = await fetch('/api/settings');
    if (response.ok) {
      const settings = await response.json();
      // Normalizar fontSize usando parseFloat para remover TODAS as unidades
      const fontSizeNum = parseFloat(String(settings.fontSize || '22'));
      const fontSize = isNaN(fontSizeNum) ? '22' : fontSizeNum.toString();
      // Normalizar pdfFontSize
      const pdfFontSizeNum = parseFloat(String(settings.pdfFontSize || '10'));
      const pdfFontSize = isNaN(pdfFontSizeNum) ? '10' : pdfFontSizeNum.toString();
      return {
        fontSize,
        pdfFontSize,
        fontFamily: settings.fontFamily || 'system',
        companyName: settings.companyName || 'Apoiotec Informática',
        pdfSubtitle: settings.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática',
        pdfPhone1: settings.pdfPhone1 || '84988288543',
        pdfPhone2: settings.pdfPhone2 || '84988363828',
        cnpj: settings.cnpj || '15.292.813.0001-70',
        address: settings.address || 'Rua Exemplo, 123 - Centro',
        phone: settings.phone || '(11) 1234-5678',
        email: settings.email || 'contato@apoiotec.com',
        primaryColor: settings.primaryColor || '#2563eb',
        secondaryColor: settings.secondaryColor || '#059669',
        footerText: settings.footerText || 'Documento emitido pelo sistema Apoiotec',
      };
    }
  } catch (error) {
    console.error('Erro ao buscar configurações de fonte:', error);
  }

  // Fallback para valores padrão
  return {
    fontSize: '22',
    pdfFontSize: '10',
    fontFamily: 'system',
    companyName: 'Apoiotec Informática',
    cnpj: '15.292.813.0001-70',
    address: 'Rua Exemplo, 123 - Centro',
    phone: '(11) 1234-5678',
    email: 'contato@apoiotec.com',
    primaryColor: '#2563eb',
    secondaryColor: '#059669',
    footerText: 'Documento emitido pelo sistema Apoiotec',
  };
}

// Mapear família de fonte para string CSS
export function mapFontFamily(fontFamily: string): string {
  const fontMap: { [key: string]: string } = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", sans-serif',
    roboto: '"Roboto", sans-serif',
    opensans: '"Open Sans", sans-serif',
    arial: 'Arial, sans-serif',
    helvetica: 'Helvetica, Arial, sans-serif',
  };
  return fontMap[fontFamily] || fontMap.system;
}
