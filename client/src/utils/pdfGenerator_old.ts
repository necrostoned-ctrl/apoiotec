import { toast } from "@/hooks/use-toast";
import type { QuoteWithClient, FinancialTransactionWithClient } from "@shared/schema";

// Helper function to download PDF
const downloadPDF = (content: string, filename: string) => {
  // Create blob with HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        @page { margin: 1in; }
        @media print { 
          body { margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
          .no-print { display: none; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .download-controls {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
          font-size: 14px;
        }
        .btn:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
      </style>
    </head>
    <body>
      <div class="download-controls no-print">
        <button class="btn" onclick="window.print()">📄 Salvar como PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">✖ Fechar</button>
      </div>
      ${content}
      <script>
        // Auto-focus to enable immediate printing
        window.onload = function() {
          window.focus();
        };
        
        // Helper function to save as HTML file if needed
        function saveAsHTML() {
          const blob = new Blob([document.documentElement.outerHTML], {
            type: 'text/html;charset=utf-8'
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '${filename.replace('.pdf', '.html')}';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      </script>
    </body>
    </html>
  `;
  
  // Try to open in new window
  const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=yes');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Automatically trigger print dialog after a short delay
    setTimeout(() => {
      if (!printWindow.closed) {
        try {
          printWindow.print();
        } catch (e) {
          console.log('Print dialog could not be triggered automatically');
        }
      }
    }, 500);
  } else {
    // Fallback: create downloadable HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Arquivo HTML baixado. Abra e use Ctrl+P para salvar como PDF." 
    });
  }
};

export interface Template {
  id: number;
  name: string;
  type: "orcamento" | "relatorio" | "recibo" | "nota_servico";
  content: string;
  header_content?: string;
  footer_content?: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  logo_url?: string;
  custom_css?: string;
  font_size?: string;
  title_font_size?: string;
  header_alignment?: string;
  content_alignment?: string;
  logo_size?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  line_height?: string;
  margin_top?: string;
  margin_bottom?: string;
  margin_left?: string;
  margin_right?: string;
  border_color?: string;
  border_width?: string;
  background_color?: string;
  is_default: boolean;
  created_at: string;
}

// Apply template styles to content
const applyTemplateStyles = (content: string, template: Template): string => {
  const styles = `
    <style>
      body {
        font-family: ${template.font_family || 'Arial, sans-serif'};
        font-size: ${template.font_size || '14px'};
        line-height: ${template.line_height || '1.6'};
        color: #333;
        margin: 0;
        padding: ${template.margin_top || '20px'} ${template.margin_right || '20px'} ${template.margin_bottom || '20px'} ${template.margin_left || '20px'};
        background-color: ${template.background_color || '#ffffff'};
      }
      .header {
        text-align: ${template.header_alignment || 'center'};
        margin-bottom: 30px;
        border-bottom: ${template.border_width || '2px'} solid ${template.border_color || template.primary_color || '#007bff'};
        padding-bottom: 20px;
      }
      .content {
        text-align: ${template.content_alignment || 'left'};
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        border-top: 1px solid #ddd;
        padding-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      h1, h2, h3 {
        color: ${template.primary_color || '#007bff'};
      }
      h1 {
        font-size: ${template.title_font_size || '28px'};
      }
      .logo {
        max-width: ${template.logo_size || '180px'};
        height: auto;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }
      th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      .value-highlight {
        background-color: ${template.primary_color || '#007bff'};
        color: white;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
        font-size: 18px;
      }
    </style>
  `;

  return `${styles}${content}`;
};

// Enhanced template variable replacement
const replaceTemplateVariables = (content: string, data: any): string => {
  let result = content;
  
  // Replace all template variables with multiple patterns
  Object.entries(data).forEach(([key, value]) => {
    const patterns = [
      new RegExp(`{{${key}}}`, 'g'),
      new RegExp(`{{ ${key} }}`, 'g'),
      new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    ];
    
    patterns.forEach(pattern => {
      result = result.replace(pattern, String(value || ''));
    });
  });
  
  return result;
};

export const generateQuotePDF = async (quote: QuoteWithClient): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE ORÇAMENTO ===");
    console.log("Quote data:", quote);
    
    // Fetch templates
    const response = await fetch("/api/templates");
    if (!response.ok) {
      console.error("Failed to fetch templates:", response.status);
      throw new Error("Failed to fetch templates");
    }
    
    const templates: Template[] = await response.json();
    console.log("Templates encontrados:", templates);
    
    const template = templates.find(t => t.type === 'orcamento' && t.is_default);
    console.log("Template selecionado:", template);
    
    if (!template) {
      console.error("No default quote template found");
      toast({ 
        title: "Erro", 
        description: "Template de orçamento não encontrado" 
      });
      return;
    }
    
    // Prepare data for template replacement
    const templateData = {
      cliente_nome: quote.client.name,
      cliente_telefone: quote.client.phone || 'Não informado',
      cliente_email: quote.client.email || 'Não informado',
      cliente_endereco: quote.client.address || 'Não informado',
      servico_descricao: quote.title,
      empresa_nome: template.company_name || 'Apoiotec Informática',
      empresa_endereco: template.company_address || 'Rua da Tecnologia, 123, Centro',
      empresa_telefone: template.company_phone || '(11) 99999-9999',
      empresa_email: template.company_email || 'contato@apoiotec.com.br',
      cor_primaria: template.primary_color || '#007bff',
      cor_secundaria: template.secondary_color || '#6c757d',
      valor_total: `R$ ${parseFloat(String(quote.total) || '0').toFixed(2).replace('.', ',')}`,
      tabela_itens: `<p>${quote.items || 'Serviço conforme solicitado'}</p>`,
      data: new Date().toLocaleDateString('pt-BR'),
      imagem: ''
    };

    console.log("Template data preparado:", templateData);

    // Process template content
    let content = '';
    
    if (template.header_content) {
      content += `<div class="header">${replaceTemplateVariables(template.header_content, templateData)}</div>`;
    }
    
    content += `<div class="content">${replaceTemplateVariables(template.content, templateData)}</div>`;
    
    if (template.footer_content) {
      content += `<div class="footer">${replaceTemplateVariables(template.footer_content, templateData)}</div>`;
    }

    console.log("Conteúdo processado:", content);

    // Apply styles and generate final HTML
    const finalHTML = applyTemplateStyles(content, template);
    
    console.log("HTML final gerado, iniciando download...");
    
    // Download PDF
    const filename = `Orcamento_${quote.client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Nome do arquivo:", filename);
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Orçamento gerado com sucesso!" 
    });
    
  } catch (error) {
    console.error("=== ERRO AO GERAR PDF DE ORÇAMENTO ===");
    console.error("Error details:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF do orçamento: ${error.message}` 
    });
  }
};

export const generateReceiptPDF = async (transaction: FinancialTransactionWithClient): Promise<void> => {
  try {
    console.log("=== GERANDO PDF DE RECIBO ===");
    console.log("Transaction data:", transaction);
    
    // Fetch templates
    const response = await fetch("/api/templates");
    if (!response.ok) {
      console.error("Failed to fetch templates:", response.status);
      throw new Error("Failed to fetch templates");
    }
    
    const templates: Template[] = await response.json();
    console.log("Templates encontrados:", templates);
    
    const template = templates.find(t => t.type === 'recibo' && t.is_default);
    console.log("Template selecionado:", template);
    
    if (!template) {
      console.error("No default receipt template found");
      toast({ 
        title: "Erro", 
        description: "Template de recibo não encontrado" 
      });
      return;
    }
    
    // Prepare data for template replacement
    const templateData = {
      cliente_nome: transaction.client?.name || 'Cliente não identificado',
      cliente_telefone: transaction.client?.phone || 'Não informado',
      cliente_email: transaction.client?.email || 'Não informado',
      cliente_endereco: transaction.client?.address || 'Não informado',
      servico_descricao: transaction.description || 'Serviço realizado',
      resolucao: transaction.resolution || 'Não especificado',
      empresa_nome: template.company_name || 'Apoiotec Informática',
      empresa_endereco: template.company_address || 'Rua da Tecnologia, 123, Centro',
      empresa_telefone: template.company_phone || '(11) 99999-9999',
      empresa_email: template.company_email || 'contato@apoiotec.com.br',
      valor_total: `R$ ${parseFloat(String(transaction.amount)).toFixed(2).replace('.', ',')}`,
      data: new Date(transaction.createdAt).toLocaleDateString('pt-BR'),
      data_pagamento: transaction.paidAt ? new Date(transaction.paidAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      imagem: ''
    };

    console.log("Template data preparado para recibo:", templateData);

    // Process template content
    let content = '';
    
    if (template.header_content) {
      content += `<div class="header">${replaceTemplateVariables(template.header_content, templateData)}</div>`;
    }
    
    content += `<div class="content">${replaceTemplateVariables(template.content, templateData)}</div>`;
    
    if (template.footer_content) {
      content += `<div class="footer">${replaceTemplateVariables(template.footer_content, templateData)}</div>`;
    }

    console.log("Conteúdo processado:", content);

    // Apply styles and generate final HTML
    const finalHTML = applyTemplateStyles(content, template);
    
    console.log("HTML final gerado, iniciando download...");
    
    // Download PDF
    const clientName = transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente';
    const filename = `Recibo_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Nome do arquivo:", filename);
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Recibo gerado com sucesso!" 
    });
    
  } catch (error) {
    console.error("=== ERRO AO GERAR PDF DE RECIBO ===");
    console.error("Error details:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar PDF do recibo: ${(error as Error).message}` 
    });
  }
};

export const generateServiceNotePDF = async (transaction: FinancialTransactionWithClient): Promise<void> => {
  try {
    console.log("Gerando PDF de nota de serviço para:", transaction);
    
    // Fetch templates
    const response = await fetch("/api/templates");
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }
    
    const templates: Template[] = await response.json();
    const template = templates.find(t => t.type === 'nota_servico' && t.is_default);
    
    if (!template) {
      throw new Error("No default service note template found");
    }
    
    // Prepare data for template replacement
    const templateData = {
      cliente_nome: transaction.client?.name || 'Cliente não identificado',
      cliente_telefone: transaction.client?.phone || 'Não informado',
      cliente_email: transaction.client?.email || 'Não informado',
      cliente_endereco: transaction.client?.address || 'Não informado',
      servico_descricao: transaction.description || 'Serviço realizado',
      resolucao: transaction.resolution || 'Não especificado',
      empresa_nome: template.company_name || 'Apoiotec Informática',
      empresa_endereco: template.company_address || 'Rua da Tecnologia, 123, Centro',
      empresa_telefone: template.company_phone || '(11) 99999-9999',
      empresa_email: template.company_email || 'contato@apoiotec.com.br',
      valor_total: `R$ ${parseFloat(transaction.amount).toFixed(2).replace('.', ',')}`,
      data: new Date(transaction.createdAt).toLocaleDateString('pt-BR'),
      data_servico: new Date(transaction.createdAt).toLocaleDateString('pt-BR'),
      imagem: ''
    };

    // Process template content
    let content = '';
    
    if (template.header_content) {
      content += `<div class="header">${replaceTemplateVariables(template.header_content, templateData)}</div>`;
    }
    
    content += `<div class="content">${replaceTemplateVariables(template.content, templateData)}</div>`;
    
    if (template.footer_content) {
      content += `<div class="footer">${replaceTemplateVariables(template.footer_content, templateData)}</div>`;
    }

    // Apply styles and generate final HTML
    const finalHTML = applyTemplateStyles(content, template);
    
    // Download PDF
    const clientName = transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente';
    downloadPDF(finalHTML, `Nota_Servico_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Nota de serviço gerada com sucesso!" 
    });
    
  } catch (error) {
    console.error("Error generating service note PDF:", error);
    toast({ 
      title: "Erro", 
      description: "Erro ao gerar PDF da nota de serviço" 
    });
  }
};

export const generateFinancialReportPDF = async (
  transactions: FinancialTransactionWithClient[],
  filters: any,
  template: Template
): Promise<void> => {
  try {
    console.log("Gerando relatório financeiro PDF com template:", template.name);
    
    // Calculate totals
    const totalEntradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalSaidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const saldo = totalEntradas - totalSaidas;
    const completedCount = transactions.filter(t => t.status === 'pago').length;
    const pendingCount = transactions.filter(t => t.status === 'pendente').length;

    // Build transactions table
    const transactionsTable = transactions.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #007bff; color: white;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Data</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Cliente</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Descrição</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Tipo</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Valor</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr style="${t.type === 'entrada' ? 'background-color: #d4edda;' : 'background-color: #f8d7da;'}">
              <td style="border: 1px solid #ddd; padding: 8px;">${new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${t.client?.name || 'N/A'}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${t.description}</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${t.type.toUpperCase()}</td>
              <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">R$ ${parseFloat(t.amount).toFixed(2).replace('.', ',')}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${t.status}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="4" style="border: 1px solid #ddd; padding: 10px; text-align: right;">TOTAIS:</td>
            <td style="border: 1px solid #ddd; padding: 10px;">R$ ${saldo.toFixed(2).replace('.', ',')}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${completedCount} Pagas / ${pendingCount} Pendentes</td>
          </tr>
        </tfoot>
      </table>
    ` : '<p style="color: #666; font-style: italic;">Nenhuma transação encontrada</p>';
    
    // Prepare data for template replacement
    const templateData = {
      // Summary totals
      total_transacoes: transactions.length.toString(),
      total_entradas: `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`,
      total_saidas: `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`,
      saldo_final: `R$ ${saldo.toFixed(2).replace('.', ',')}`,
      receita_total: `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`,
      transacoes_pagas: completedCount.toString(),
      transacoes_pendentes: pendingCount.toString(),
      
      // Filter information
      data_inicio: filters.startDate || 'Não especificado',
      data_fim: filters.endDate || 'Não especificado',
      cliente_filtro: filters.clientId ? 'Filtrado por cliente' : 'Todos os clientes',
      usuario_filtro: filters.userFilter ? 'Filtrado por usuário' : 'Todos os usuários',
      status_filtro: filters.statusFilter ? filters.statusFilter : 'Todos os status',
      tipo_filtro: filters.typeFilter ? filters.typeFilter : 'Todos os tipos',
      
      // Data table
      tabela_transacoes: transactionsTable,
      tabela_itens: transactionsTable, // Alias for compatibility
      
      // Company information
      empresa_nome: template.company_name || 'Apoiotec Informática',
      empresa_endereco: template.company_address || 'Rua da Tecnologia, 123, Centro',
      empresa_telefone: template.company_phone || '(11) 99999-9999',
      empresa_email: template.company_email || 'contato@apoiotec.com.br',
      
      // Dates
      data: new Date().toLocaleDateString('pt-BR'),
      data_geracao: new Date().toLocaleDateString('pt-BR'),
      
      // User
      usuario: 'Marcelo',
      tecnico: 'Marcelo'
    };

    // Process template content
    let content = '';
    
    if (template.header_content) {
      content += `<div class="header">${replaceTemplateVariables(template.header_content, templateData)}</div>`;
    }
    
    content += `<div class="content">${replaceTemplateVariables(template.content, templateData)}</div>`;
    
    if (template.footer_content) {
      content += `<div class="footer">${replaceTemplateVariables(template.footer_content, templateData)}</div>`;
    }

    console.log("Template data preparado para relatório:", templateData);

    // Apply styles and generate final HTML
    const finalHTML = applyTemplateStyles(content, template);
    
    console.log("HTML final gerado, iniciando download...");
    
    // Download PDF
    const filename = `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Nome do arquivo:", filename);
    
    downloadPDF(finalHTML, filename);
    
    toast({ 
      title: "PDF Gerado", 
      description: "Relatório financeiro gerado com sucesso!" 
    });
    
  } catch (error) {
    console.error("=== ERRO AO GERAR RELATÓRIO FINANCEIRO ===");
    console.error("Error details:", error);
    toast({ 
      title: "Erro", 
      description: `Erro ao gerar relatório financeiro: ${(error as Error).message}` 
    });
  }
};

export const generateReportPDF = async (transactions: FinancialTransactionWithClient[], filters: any): Promise<void> => {
  try {
    // Fetch templates for reports
    const response = await fetch("/api/templates");
    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }
    
    const templates: Template[] = await response.json();
    const template = templates.find(t => t.type === 'relatorio' && t.is_default) || templates.find(t => t.type === 'relatorio');
    
    if (!template) {
      throw new Error("No report template found");
    }
    
    await generateFinancialReportPDF(transactions, filters, template);
    
  } catch (error) {
    console.error("Error generating report PDF:", error);
    toast({ 
      title: "Erro", 
      description: "Erro ao gerar PDF do relatório" 
    });
  }
};