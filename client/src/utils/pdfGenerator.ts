import { toast } from "@/hooks/use-toast";
import type { QuoteWithClient, FinancialTransactionWithClient } from "@shared/schema";

// Formatação de data padronizada para todos os PDFs
const formatDateForPDF = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// SISTEMA DE PDF SIMPLIFICADO - IMPRESSÃO DIRETA SEM .HTM
const downloadPDF = (content: string, filename: string) => {
  console.log("=== GERANDO PDF DIRETO ===");
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast({
      title: "Erro",
      description: "Verifique se popups estão permitidos",
      variant: "destructive"
    });
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename.replace('.pdf', '')}</title>
  <style>
    @page { margin: 0.5in; size: A4; }
    @media print { 
      body { margin: 0; -webkit-print-color-adjust: exact; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.4;
      color: #333;
      margin: 0;
      padding: 20px;
      background: white;
    }
  </style>
</head>
<body>
  ${content}
  <script>
    window.onload = function() {
      setTimeout(() => window.print(), 500);
    };
    window.onafterprint = function() {
      setTimeout(() => window.close(), 1000);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
};

// Substituição de variáveis melhorada com log para debug
const replaceTemplateVariables = (content: string, data: Record<string, string>): string => {
  let result = content;
  
  console.log("=== DADOS PARA SUBSTITUIÇÃO ===", data);
  
  Object.entries(data).forEach(([key, value]) => {
    const cleanValue = String(value || 'Não informado').trim();
    
    // Múltiplos padrões para garantir substituição completa
    const patterns = [
      new RegExp(`{{\\s*${key}\\s*}}`, 'gi'),
      new RegExp(`\\{\\{${key}\\}\\}`, 'gi'),
      new RegExp(`{{ ${key} }}`, 'gi'),
      new RegExp(`{{${key}}}`, 'gi')
    ];
    
    patterns.forEach(pattern => {
      const before = result;
      result = result.replace(pattern, cleanValue);
      if (before !== result) {
        console.log(`Substituído ${key}: "${pattern}" -> "${cleanValue}"`);
      }
    });
  });
  
  // Verificar se ainda restam variáveis não substituídas
  const remainingVars = result.match(/\{\{[^}]+\}\}/g);
  if (remainingVars) {
    console.warn("Variáveis não substituídas:", remainingVars);
  }
  
  return result;
};

// Aplicação de estilos com fontes menores conforme configuração
const applyTemplateStyles = (content: string, template: any): string => {
  const primaryColor = template.primary_color || '#007bff';
  const secondaryColor = template.secondary_color || '#6c757d';
  const fontSize = template.font_size || '12px';
  const titleFontSize = template.title_font_size || '16px';
  
  const styles = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: ${template.font_family || 'Arial, sans-serif'};
        font-size: ${fontSize};
        line-height: ${template.line_height || '1.6'};
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
      }
      
      .document-header {
        background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
        color: white;
        padding: 25px;
        margin: -20px -20px 30px -20px;
        text-align: center;
        border-radius: 0 0 15px 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
      }
      
      .logo-container {
        margin-bottom: 10px;
      }
      
      .company-logo {
        max-height: 60px;
        max-width: 150px;
        object-fit: contain;
      }
      
      .company-info {
        text-align: center;
      }
      
      .company-name {
        font-size: ${titleFontSize};
        font-weight: 700;
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .company-details {
        font-size: ${parseInt(fontSize) - 2}px;
        opacity: 0.9;
        margin: 8px 0;
        line-height: 1.4;
      }
      
      .document-title {
        font-size: ${parseInt(titleFontSize) - 2}px;
        font-weight: 600;
        margin: 10px 0 0 0;
        opacity: 0.95;
        padding: 8px 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 20px;
      }
      
      .client-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 4px solid ${primaryColor};
      }
      
      .section-title {
        color: ${primaryColor};
        font-weight: 600;
        font-size: ${parseInt(fontSize) + 2}px;
        margin: 0 0 15px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .client-details {
        margin-top: 10px;
      }
      
      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .info-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      
      .info-label {
        font-weight: 600;
        color: #555;
        min-width: 80px;
      }
      
      .info-value {
        color: #333;
        font-weight: 500;
      }
      
      .service-section {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 4px solid ${primaryColor};
      }
      
      .service-content {
        margin-top: 10px;
      }
      
      .service-description {
        background: white;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border: 1px solid #e0e0e0;
        line-height: 1.5;
      }
      
      .resolution-info {
        background: #e8f4f8;
        padding: 12px;
        border-radius: 6px;
        margin: 10px 0;
        border-left: 3px solid ${primaryColor};
      }
      
      .service-details {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .detail-label {
        font-weight: 600;
        color: #555;
        min-width: 100px;
      }
      
      .detail-value {
        color: #333;
        font-weight: 500;
      }
      
      .value-section {
        background: linear-gradient(135deg, ${primaryColor}22, ${primaryColor}11);
        padding: 25px;
        border-radius: 15px;
        margin: 30px 0;
        border: 2px solid ${primaryColor}33;
        text-align: center;
      }
      
      .value-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .value-label {
        font-size: ${parseInt(fontSize) + 2}px;
        font-weight: 600;
        color: ${primaryColor};
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .value-amount {
        font-size: ${parseInt(titleFontSize) + 4}px;
        font-weight: 700;
        color: ${primaryColor};
        background: white;
        padding: 15px 30px;
        border-radius: 10px;
        border: 2px solid ${primaryColor};
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .footer-section {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      
      .signature-area {
        flex: 1;
        margin-right: 40px;
      }
      
      .signature-line {
        border-bottom: 2px solid #333;
        width: 200px;
        margin-bottom: 8px;
      }
      
      .signature-label {
        font-size: ${parseInt(fontSize) - 1}px;
        color: #666;
        text-align: center;
      }
      
      .date-info {
        text-align: right;
        flex: 1;
      }
      
      .date-info p {
        margin: 5px 0;
        font-size: ${parseInt(fontSize) - 1}px;
        color: #666;
      }
      
      .validity {
        font-style: italic;
        color: #888;
      }
      
      .client-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        border-left: 4px solid ${primaryColor};
      }
      
      .client-info h3 {
        color: ${primaryColor};
        font-size: ${parseInt(fontSize) + 2}px;
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .info-row {
        display: flex;
        margin-bottom: 8px;
        align-items: center;
      }
      
      .info-label {
        font-weight: 600;
        color: ${secondaryColor};
        min-width: 80px;
        font-size: ${parseInt(fontSize) - 1}px;
      }
      
      .info-value {
        color: #333;
        font-size: ${fontSize};
      }
      
      .content {
        margin: 20px 0;
      }
      
      .content h3 {
        color: ${primaryColor};
        font-size: ${parseInt(fontSize) + 2}px;
        margin: 20px 0 10px 0;
        font-weight: 600;
      }
      
      .service-description {
        background: white;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        margin: 10px 0;
        font-size: ${fontSize};
        line-height: 1.6;
      }
      
      .value-highlight {
        background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}25);
        border: 2px solid ${primaryColor};
        border-radius: 12px;
        padding: 20px;
        margin: 25px 0;
        text-align: center;
      }
      
      .value-highlight .label {
        font-size: ${parseInt(fontSize) + 1}px;
        color: ${secondaryColor};
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      
      .value-highlight .amount {
        font-size: ${parseInt(titleFontSize) + 4}px;
        font-weight: 700;
        color: ${primaryColor};
      }
      
      .summary-box {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
      }
      
      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        border-bottom: 1px solid #e9ecef;
        font-size: ${fontSize};
      }
      
      .summary-row:last-child {
        border-bottom: none;
        font-weight: 600;
      }
      
      .date-stamp {
        text-align: center;
        margin-top: 30px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: ${parseInt(fontSize) - 1}px;
        color: ${secondaryColor};
        font-style: italic;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      th {
        background: ${primaryColor};
        color: white;
        padding: 12px 10px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: ${parseInt(fontSize) - 1}px;
        letter-spacing: 0.3px;
      }
      
      td {
        padding: 10px;
        border-bottom: 1px solid #f1f3f4;
        vertical-align: middle;
        font-size: ${fontSize};
      }
      
      tr:hover {
        background-color: #f8f9fa;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      @media print {
        body { margin: 0; padding: 15px; }
        .document-header { margin: -15px -15px 25px -15px; }
        table { page-break-inside: avoid; }
        .value-highlight, .summary-box { page-break-inside: avoid; }
      }
    </style>
  `;
  
  return styles + content;
};

// Gerador de PDF para Orçamentos
export const generateQuotePDF = async (quote: QuoteWithClient): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE ORÇAMENTO ===");

    const response = await fetch("/api/templates");
    const templates = await response.json();
    const template = templates.find((t: any) => t.name === "Orçamento") || templates[0];

    if (!template) {
      throw new Error("Template de orçamento não encontrado");
    }

    // Parse products - verificar múltiplos campos possíveis
    let products = [];
    try {
      console.log("Quote data:", quote);
      if (quote.items) {
        products = JSON.parse(quote.items);
      } else if ((quote as any).products) {
        products = JSON.parse((quote as any).products);
      } else if (quote.description && quote.description.includes('[')) {
        // Tentar extrair de description se contém JSON
        const match = quote.description.match(/\[.*\]/);
        if (match) {
          products = JSON.parse(match[0]);
        }
      }
      console.log("Produtos encontrados:", products);
    } catch (e) {
      console.log("Erro ao parsear produtos:", e);
      console.log("Dados brutos:", quote.items || (quote as any).products || quote.description);
    }

    // Separar Serviços e Produtos
    const servicosItems = products.filter((p: any) => p.type === 'servico');
    const produtosItems = products.filter((p: any) => p.type === 'produto' || !p.type);

    // Build Serviços table com cabeçalho AZUL
    const servicosTable = servicosItems.length > 0 ? `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #0066cc, #0052a3); color: white; font-weight: bold;">
              <th style="padding: 12px; text-align: left; border: 1px solid #0066cc;">📋 SERVIÇOS</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #0066cc;">Qtd</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #0066cc;">V. Unit.</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #0066cc;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${servicosItems.map((item: any) => {
              const qtd = parseInt(item.quantity?.toString() || '1') || 1;
              const valor = parseFloat(item.amount || item.price || 0);
              return `
                <tr style="border: 1px solid #e0e0e0;">
                  <td style="padding: 10px; color: #0066cc; font-weight: 500;">${item.description || item.name}</td>
                  <td style="padding: 10px; text-align: center;">${qtd}</td>
                  <td style="padding: 10px; text-align: right;">R$ ${(valor / qtd).toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #0066cc;">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    // Build Produtos table com cabeçalho VERDE
    const produtosTable = produtosItems.length > 0 ? `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; font-weight: bold;">
              <th style="padding: 12px; text-align: left; border: 1px solid #22c55e;">📦 PRODUTOS/MATERIAIS</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #22c55e;">Qtd</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #22c55e;">V. Unit.</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #22c55e;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${produtosItems.map((item: any) => {
              const qtd = parseInt(item.quantity?.toString() || '1') || 1;
              const valor = parseFloat(item.amount || item.price || 0);
              return `
                <tr style="border: 1px solid #e0e0e0;">
                  <td style="padding: 10px; color: #22c55e; font-weight: 500;">${item.description || item.name}</td>
                  <td style="padding: 10px; text-align: center;">${qtd}</td>
                  <td style="padding: 10px; text-align: right;">R$ ${(valor / qtd).toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #22c55e;">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    // Calcular totais
    const servicosTotal = servicosItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.amount || item.price || 0));
    }, 0);
    
    const produtosTotal = produtosItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.amount || item.price || 0));
    }, 0);
    
    const grandTotal = servicosTotal + produtosTotal;

    const productsTable = servicosTable + produtosTable;

    const templateData = {
      empresa_nome: template.companyName || 'Apoiotec Informática',
      numero_orcamento: quote.id.toString(),
      cliente_nome: quote.client?.name || 'Cliente não informado',
      cliente_telefone: quote.client?.phone || 'Não informado',
      cliente_email: quote.client?.email || 'Não informado',
      cliente_endereco: quote.client?.address || 'Não informado',
      servico_descricao: quote.title || quote.description || 'Serviço não especificado',
      tabela_itens: productsTable,
      valor_servicos: `R$ ${servicosTotal.toFixed(2).replace('.', ',')}`,
      valor_produtos: `R$ ${produtosTotal.toFixed(2).replace('.', ',')}`,
      valor_total: `R$ ${grandTotal > 0 ? grandTotal.toFixed(2).replace('.', ',') : parseFloat(quote.total.toString()).toFixed(2).replace('.', ',')}`,
      data: formatDateForPDF(new Date())
    };

    let content = replaceTemplateVariables(template.content, templateData);
    const finalHTML = applyTemplateStyles(content, template);
    const filename = `Orcamento_${quote.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Orçamento gerado com sucesso!" 
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF: ${(error as Error).message}` 
    });
  }
};

// Gerador de PDF para Recibos
export const generateReceiptPDF = async (transaction: FinancialTransactionWithClient): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE RECIBO ===");

    const response = await fetch("/api/templates");
    const templates = await response.json();
    const template = templates.find((t: any) => t.name === "Recibo") || templates[0];

    if (!template) {
      throw new Error("Template de recibo não encontrado");
    }

    const templateData = {
      empresa_nome: template.company_name || 'Apoiotec Informática',
      numero_recibo: transaction.id.toString(),
      cliente_nome: transaction.client?.name || 'Cliente não informado',
      cliente_telefone: transaction.client?.phone || 'Não informado',
      cliente_email: transaction.client?.email || 'Não informado',
      servico_descricao: transaction.description || 'Serviço não especificado',
      valor_total: `R$ ${parseFloat(transaction.amount.toString()).toFixed(2)}`,
      data: formatDateForPDF(new Date())
    };

    let content = replaceTemplateVariables(template.content, templateData);
    const finalHTML = applyTemplateStyles(content, template);
    const filename = `Recibo_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Recibo gerado com sucesso!" 
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF: ${(error as Error).message}` 
    });
  }
};

// Gerador de PDF para Notas de Serviço
export const generateServiceNotePDF = async (transaction: FinancialTransactionWithClient): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE NOTA DE SERVIÇO ===");
    console.log("Dados da transação:", transaction);

    const response = await fetch("/api/templates");
    const templates = await response.json();
    const template = templates.find((t: any) => t.name === "Nota de Serviço") || templates[0];

    if (!template) {
      throw new Error("Template de nota de serviço não encontrado");
    }

    console.log("Template encontrado:", template);

    // Parse Serviços e Produtos
    let servicosItems = [];
    let produtosItems = [];
    
    try {
      if (transaction.serviceDetails) {
        servicosItems = JSON.parse(transaction.serviceDetails);
      }
      if (transaction.productDetails) {
        produtosItems = JSON.parse(transaction.productDetails);
      }
    } catch (e) {
      console.log("Erro ao parsear detalhes:", e);
    }

    // Build Serviços table com cabeçalho AZUL
    const servicosTable = servicosItems.length > 0 ? `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #0066cc, #0052a3); color: white; font-weight: bold;">
              <th style="padding: 12px; text-align: left; border: 1px solid #0066cc;">📋 SERVIÇOS</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #0066cc;">Qtd</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #0066cc;">V. Unit.</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #0066cc;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${servicosItems.map((item: any) => {
              const qtd = parseInt(item.quantity?.toString() || '1') || 1;
              const valor = parseFloat(item.amount || 0);
              return `
                <tr style="border: 1px solid #e0e0e0;">
                  <td style="padding: 10px; color: #0066cc; font-weight: 500;">${item.name}</td>
                  <td style="padding: 10px; text-align: center;">${qtd}</td>
                  <td style="padding: 10px; text-align: right;">R$ ${(valor / qtd).toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #0066cc;">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    // Build Produtos table com cabeçalho VERDE
    const produtosTable = produtosItems.length > 0 ? `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; font-weight: bold;">
              <th style="padding: 12px; text-align: left; border: 1px solid #22c55e;">📦 PRODUTOS/MATERIAIS</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #22c55e;">Qtd</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #22c55e;">V. Unit.</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #22c55e;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${produtosItems.map((item: any) => {
              const qtd = parseInt(item.quantity?.toString() || '1') || 1;
              const valor = parseFloat(item.amount || 0);
              return `
                <tr style="border: 1px solid #e0e0e0;">
                  <td style="padding: 10px; color: #22c55e; font-weight: 500;">${item.name}</td>
                  <td style="padding: 10px; text-align: center;">${qtd}</td>
                  <td style="padding: 10px; text-align: right;">R$ ${(valor / qtd).toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #22c55e;">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const itemsTable = servicosTable + produtosTable;

    // Calcular totais
    const servicosTotal = servicosItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.amount || 0));
    }, 0);
    
    const produtosTotal = produtosItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.amount || 0));
    }, 0);

    // Preparar dados com verificação completa
    const templateData = {
      empresa_nome: template.companyName || 'Apoiotec Informática',
      numero_nota: transaction.id?.toString() || '0',
      cliente_nome: transaction.client?.name || 'Cliente não informado',
      cliente_telefone: transaction.client?.phone || 'Não informado',
      cliente_email: transaction.client?.email || 'Não informado',
      servico_descricao: transaction.description || 'Serviço não especificado',
      resolucao: transaction.resolution || 'Resolução não informada',
      status_servico: transaction.status === 'pago' ? 'Concluído' : 'Em andamento',
      data_servico: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR') : 'Não informado',
      tecnico_responsavel: transaction.user?.username || 'Marcelo',
      tabela_itens: itemsTable,
      valor_servicos: `R$ ${servicosTotal.toFixed(2).replace('.', ',')}`,
      valor_produtos: `R$ ${produtosTotal.toFixed(2).replace('.', ',')}`,
      valor_total: `R$ ${parseFloat(transaction.amount?.toString() || '0').toFixed(2).replace('.', ',')}`,
      data: formatDateForPDF(new Date())
    };

    console.log("Dados do template:", templateData);

    // Aplicar substituição das variáveis
    let content = replaceTemplateVariables(template.content, templateData);
    console.log("Conteúdo após substituição:", content);
    
    const finalHTML = applyTemplateStyles(content, template);
    const filename = `NotaServico_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Nota de serviço gerada com sucesso!" 
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF: ${(error as Error).message}` 
    });
  }
};

// Gerador de PDF para Relatórios
export const generateReportPDF = async (transactions: any[], period: string): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE RELATÓRIO ===");

    const response = await fetch("/api/templates");
    const templates = await response.json();
    const template = templates.find((t: any) => t.name === "Relatórios") || templates[0];

    if (!template) {
      throw new Error("Template de relatório não encontrado");
    }

    // Calcular totais
    const totalEntradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const totalSaidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const saldoFinal = totalEntradas - totalSaidas;

    // Criar tabela de transações
    const transactionsTable = `
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(transaction => `
            <tr>
              <td>${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</td>
              <td>${transaction.client?.name || 'N/A'}</td>
              <td>${transaction.description}</td>
              <td style="color: ${transaction.type === 'entrada' ? '#22c55e' : '#ef4444'};">
                ${transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
              </td>
              <td style="color: ${transaction.type === 'entrada' ? '#22c55e' : '#ef4444'};">
                R$ ${parseFloat(transaction.amount.toString()).toFixed(2)}
              </td>
              <td>${transaction.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const templateData = {
      empresa_nome: template.company_name || 'Apoiotec Informática',
      periodo: period,
      total_transacoes: transactions.length.toString(),
      total_entradas: `R$ ${totalEntradas.toFixed(2)}`,
      total_saidas: `R$ ${totalSaidas.toFixed(2)}`,
      saldo_final: `R$ ${saldoFinal.toFixed(2)}`,
      tabela_transacoes: transactionsTable,
      data: formatDateForPDF(new Date())
    };

    let content = replaceTemplateVariables(template.content, templateData);
    const finalHTML = applyTemplateStyles(content, template);
    const filename = `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Relatório gerado com sucesso!" 
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF: ${(error as Error).message}` 
    });
  }
};

// Gerador de PDF para Relatório de Serviços por Cliente
export const generateServiceReportPDF = async (data: any): Promise<void> => {
  try {
    const { clientName, services, startDate, endDate } = data;
    
    // Build services table
    const servicesTable = services.length > 0 ? `
      <div style="margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #0066cc, #0052a3); color: white; font-weight: bold;">
              <th style="padding: 12px; text-align: left; border: 1px solid #0066cc;">Data</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #0066cc;">Descrição</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #0066cc;">Tipo</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #0066cc;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${services.map((service: any) => `
              <tr style="border: 1px solid #e0e0e0;">
                <td style="padding: 10px; color: #333;">${formatDateForPDF(service.createdAt)}</td>
                <td style="padding: 10px; color: #0066cc; font-weight: 500;">${service.name}</td>
                <td style="padding: 10px; text-align: center;">${service.serviceType || '-'}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #0066cc;">R$ ${(service.registrationFee || 0).toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '<p>Nenhum serviço encontrado.</p>';

    const totalValue = services.reduce((sum: number, s: any) => sum + (s.registrationFee || 0), 0);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Serviços</title>
        <style>
          @page { margin: 0.5in; size: A4; }
          @media print { body { margin: 0; -webkit-print-color-adjust: exact; } }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            background: linear-gradient(135deg, #0066cc, #0052a3);
            color: white;
            padding: 20px;
            margin: -20px -20px 20px -20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
          }
          .doc-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .doc-info-left { text-align: left; }
          .doc-info-right { text-align: right; }
          .doc-info-right div { margin-bottom: 5px; }
          .balloon {
            background: #f0f5ff;
            border: 2px solid #0066cc;
            border-radius: 15px;
            padding: 15px 20px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            color: #0066cc;
            font-size: 16px;
          }
          .total-row {
            background: #f0f5ff;
            padding: 15px;
            margin: 20px 0;
            text-align: right;
            font-weight: bold;
            border-radius: 8px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Serviços</h1>
          <p>Apoiotec Informática</p>
        </div>

        <div class="doc-info">
          <div class="doc-info-left">
            <strong>Nota de Serviço</strong><br>
            <strong>Relatório #1</strong><br>
            <strong>${formatDateForPDF(new Date())}</strong>
          </div>
          <div class="doc-info-right">
            <div><strong>Período:</strong> ${formatDateForPDF(startDate)} a ${formatDateForPDF(endDate)}</div>
            <div><strong>Data de Emissão:</strong> ${formatDateForPDF(new Date())}</div>
          </div>
        </div>

        <div class="balloon">${clientName || 'Cliente não especificado'}</div>

        ${servicesTable}

        <div class="total-row">
          Total: R$ ${totalValue.toFixed(2).replace('.', ',')}
        </div>
      </body>
      <script>
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
        window.onafterprint = function() {
          setTimeout(() => window.close(), 1000);
        };
      </script>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    }

    toast({ 
      title: "PDF Gerado", 
      description: "Relatório de serviços gerado com sucesso!" 
    });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF: ${(error as Error).message}` 
    });
  }
};

// Alias para compatibilidade com módulos existentes
export const generateFinancialReportPDF = generateReportPDF;