// Sistema unificado de geração de PDF
import { toast } from "@/hooks/use-toast";

// Helper function to extract clean description from transaction
const getCleanDescription = (description: string): string => {
  if (!description) return "Serviço executado conforme solicitado";
  
  // If description contains structured data (JSON), extract only the readable part
  if (description.includes('[{') && description.includes('}]')) {
    const lines = description.split('\n');
    // Find lines before "Discriminação de valores:" or JSON data
    const cleanLines = lines.filter(line => 
      !line.includes('[{') &&
      !line.includes('}]') &&
      !line.includes('Discriminação de valores:') &&
      !line.includes('Serviços:') &&
      !line.includes('Produtos/Materiais:') &&
      !line.startsWith('- R$') &&
      line.trim() !== ''
    );
    
    return cleanLines.join('\n').trim() || lines[0] || "Serviço executado";
  }
  
  return description;
};

// Função principal para download de PDF - sem popups problemáticos
const downloadPDF = (content: string, filename: string) => {
  console.log("=== GERANDO PDF ===", filename);
  
  try {
    // Criar blob HTML
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename.replace('.pdf', '')}</title>
  <style>
    @page { 
      margin: 0.75in; 
      size: A4; 
    }
    @media print { 
      body { 
        margin: 0; 
        -webkit-print-color-adjust: exact; 
        color-adjust: exact;
      }
      .no-print { display: none; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.4;
      color: #333;
      margin: 0;
      padding: 20px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563eb;
    }
    .company-info {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #2563eb;
      color: white;
      font-weight: bold;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      text-align: right;
      margin-top: 20px;
    }
    .entrada { color: #059669; }
    .saida { color: #dc2626; }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Imprimir/Salvar PDF</button>
  ${content}
  <script>
    // Auto-print após 1 segundo
    setTimeout(() => {
      window.print();
    }, 1000);
  </script>
</body>
</html>`;

    // Criar blob e abrir em nova aba
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Abrir em nova aba
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // Fallback: download direto
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.pdf', '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Gerado",
        description: "Arquivo baixado. Abra e pressione Ctrl+P para salvar como PDF.",
      });
    } else {
      // Limpar URL após 30 segundos
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);
    }
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast({
      title: "Erro",
      description: "Erro ao gerar PDF. Tente novamente.",
      variant: "destructive",
    });
  }
};

// Função para substituir variáveis do template
const replaceTemplateVariables = (content: string, data: any): string => {
  let result = content;
  
  console.log("=== SUBSTITUINDO VARIÁVEIS ===");
  console.log("Dados disponíveis:", Object.keys(data));
  
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
        console.log(`✓ Substituído ${key}: "${cleanValue}"`);
      }
    });
  });
  
  // Verificar se ainda restam variáveis não substituídas
  const remainingVars = result.match(/\{\{[^}]+\}\}/g);
  if (remainingVars) {
    console.warn("⚠ Variáveis não substituídas:", remainingVars);
    // Substituir variáveis não encontradas por texto vazio
    remainingVars.forEach(varName => {
      result = result.replace(new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    });
  }
  
  return result;
};

// Gerador de PDF para Relatórios Financeiros
export const generateFinancialReportPDF = async (transactions: any[], filters: any, template?: any) => {
  try {
    console.log("=== GERANDO RELATÓRIO FINANCEIRO ===");
    
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
            <th>Descrição</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td>${new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
              <td>${t.description || 'Sem descrição'}</td>
              <td>${t.client?.name || 'N/A'}</td>
              <td class="${t.type}">${t.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
              <td>${t.status || 'Pendente'}</td>
              <td class="${t.type}">R$ ${parseFloat(t.amount.toString()).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    let content = '';
    
    if (template && template.content) {
      // Usar template personalizado
      const templateData = {
        empresa_nome: 'Apoiotec Informática',
        empresa_cnpj: '00.000.000/0001-00',
        empresa_endereco: 'Rua da Tecnologia, 123 - Centro',
        empresa_telefone: '(11) 99999-9999',
        empresa_email: 'contato@apoiotec.com.br',
        data: new Date().toLocaleDateString('pt-BR'),
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        periodo: filters.startDate && filters.endDate ? 
          `${filters.startDate} a ${filters.endDate}` : 'Todos os períodos',
        total_transacoes: transactions.length.toString(),
        total_entradas: `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`,
        total_saidas: `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`,
        saldo_final: `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`,
        tabela_transacoes: transactionsTable
      };
      
      content = replaceTemplateVariables(template.content, templateData);
    } else {
      // Template padrão
      content = `
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <p>Apoiotec Informática</p>
          <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="company-info">
          <strong>Apoiotec Informática</strong><br>
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro<br>
          Telefone: (11) 99999-9999<br>
          Email: contato@apoiotec.com.br
        </div>
        
        <div style="margin: 20px 0;">
          <h3>Resumo Financeiro</h3>
          <p><strong>Total de Transações:</strong> ${transactions.length}</p>
          <p class="entrada"><strong>Total Entradas:</strong> R$ ${totalEntradas.toFixed(2)}</p>
          <p class="saida"><strong>Total Saídas:</strong> R$ ${totalSaidas.toFixed(2)}</p>
          <p class="total">Saldo Final: R$ ${saldoFinal.toFixed(2)}</p>
        </div>
        
        ${transactionsTable}
      `;
    }
    
    const filename = `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadPDF(content, filename);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw error;
  }
};

// Gerador de PDF para Orçamentos
export const generateQuotePDF = async (quote: any, template?: any) => {
  try {
    console.log("=== GERANDO PDF ORÇAMENTO ===");
    
    // Processar itens do orçamento
    let items: any[] = [];
    try {
      if (quote.items) {
        items = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
      }
    } catch (e) {
      console.log("Erro ao processar itens:", e);
    }
    
    const totalValue = items.reduce((sum: number, item: any) => sum + parseFloat(item.amount || item.price || 0), 0);
    
    let content = '';
    
    if (template && template.content) {
      // Separar itens por tipo (serviços vs produtos)
      const servicosItems = items.filter(item => item.type === 'servico');
      const produtosItems = items.filter(item => item.type === 'produto');
      
      // Criar tabela de itens formatada com estilo profissional
      let itemsTable = '';
      
      if (servicosItems.length > 0) {
        itemsTable += `
          <div style="margin: 20px 0;">
            <h4 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 10px;">🔧 Serviços</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #2563eb; color: white;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #2563eb;">Descrição</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #2563eb;">Qtd</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #2563eb;">Valor Unit.</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #2563eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${servicosItems.map(item => `
                  <tr style="background-color: #f0f8ff;">
                    <td style="padding: 10px; border: 1px solid #2563eb;">${item.name || item.description || 'Serviço'}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #2563eb;">${item.quantity || 1}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #2563eb;">R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #2563eb;">R$ ${(parseFloat(item.amount || item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      
      if (produtosItems.length > 0) {
        itemsTable += `
          <div style="margin: 20px 0;">
            <h4 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 5px; margin-bottom: 10px;">📦 Produtos/Materiais</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #16a34a; color: white;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #16a34a;">Descrição</th>
                  <th style="padding: 10px; text-align: center; border: 1px solid #16a34a;">Qtd</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #16a34a;">Valor Unit.</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #16a34a;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${produtosItems.map(item => `
                  <tr style="background-color: #f0fdf4;">
                    <td style="padding: 10px; border: 1px solid #16a34a;">${item.name || item.description || 'Produto'}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #16a34a;">${item.quantity || 1}</td>
                    <td style="padding: 10px; text-align: right; border: 1px solid #16a34a;">R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #16a34a;">R$ ${(parseFloat(item.amount || item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      
      // Total final
      if (items.length > 0) {
        itemsTable += `
          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border: 2px solid #2563eb; border-radius: 5px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold; font-size: 18px; text-align: right;">TOTAL GERAL:</td>
                <td style="padding: 10px; font-weight: bold; font-size: 18px; text-align: right; color: #2563eb; width: 150px;">R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
              </tr>
            </table>
          </div>
        `;
      }

      const templateData = {
        empresa_nome: 'Apoiotec Informática',
        empresa_cnpj: '00.000.000/0001-00',
        empresa_endereco: 'Rua da Tecnologia, 123 - Centro',
        empresa_telefone: '(11) 99999-9999',
        empresa_email: 'contato@apoiotec.com.br',
        cliente_nome: quote.client?.name || 'Cliente',
        cliente_telefone: quote.client?.phone || 'Não informado',
        cliente_email: quote.client?.email || 'Não informado',
        data: new Date().toLocaleDateString('pt-BR'),
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        descricao: quote.description || quote.title || 'Orçamento para serviços técnicos',
        valor_total: `R$ ${totalValue.toFixed(2).replace('.', ',')}`,
        tabela_itens: itemsTable,
        numero_orcamento: quote.id?.toString() || '001',
        imagem: ''
      };
      
      content = replaceTemplateVariables(template.content, templateData);
    } else {
      // Fallback if no template
      content = `
        <div class="header">
          <h1>ORÇAMENTO #${quote.id}</h1>
          <p>Apoiotec Informática</p>
        </div>
        
        <div class="company-info">
          <strong>Apoiotec Informática</strong><br>
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro<br>
          Telefone: (11) 99999-9999<br>
          Email: contato@apoiotec.com.br
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Cliente</h3>
          <p><strong>Nome:</strong> ${quote.client?.name || 'Cliente'}</p>
          <p><strong>Telefone:</strong> ${quote.client?.phone || 'N/A'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Descrição</h3>
          <p>${quote.description || quote.title || 'Orçamento de serviços'}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Valor Total</h3>
          <div style="font-size: 24px; font-weight: bold; color: #16a34a;">
            R$ ${totalValue.toFixed(2).replace('.', ',')}
          </div>
        </div>
      `;
    }
    
    const filename = `Orcamento_${quote.id}_${quote.client?.name?.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
    downloadPDF(content, filename);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Erro ao gerar PDF do orçamento:', error);
    throw error;
  }
};

// Gerador de PDF para Recibos
export const generateReceiptPDF = async (transaction: any, template?: any) => {
  try {
    console.log("=== GERANDO PDF RECIBO ===");
    
    let content = '';
    
    if (template && template.content) {
      const templateData = {
        empresa_nome: 'Apoiotec Informática',
        empresa_cnpj: '00.000.000/0001-00',
        empresa_endereco: 'Rua da Tecnologia, 123 - Centro',
        empresa_telefone: '(11) 99999-9999',
        empresa_email: 'contato@apoiotec.com.br',
        cliente_nome: transaction.client?.name || 'Cliente',
        cliente_telefone: transaction.client?.phone || 'Não informado',
        cliente_email: transaction.client?.email || 'Não informado',
        data: new Date().toLocaleDateString('pt-BR'),
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        descricao: transaction.description || 'Serviço prestado',
        servico_descricao: transaction.description || 'Serviço prestado',
        valor: `R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}`,
        valor_total: `R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}`,
        resolution: transaction.resolution || '',
        imagem: '' // Placeholder para imagem se necessário
      };
      
      content = replaceTemplateVariables(template.content, templateData);
    } else {
      content = `
        <div class="header">
          <h1>RECIBO</h1>
          <p>Apoiotec Informática</p>
        </div>
        
        <div class="company-info">
          <strong>Apoiotec Informática</strong><br>
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro<br>
          Telefone: (11) 99999-9999<br>
          Email: contato@apoiotec.com.br
        </div>
        
        <div style="margin: 30px 0;">
          <p><strong>Cliente:</strong> ${transaction.client?.name || 'Cliente'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Descrição:</strong> ${transaction.description || 'Serviço prestado'}</p>
          ${transaction.resolution ? `<p><strong>Resolução:</strong> ${transaction.resolution}</p>` : ''}
        </div>
        
        <div class="total">
          <p>VALOR RECEBIDO: R$ ${parseFloat(transaction.amount.toString()).toFixed(2)}</p>
        </div>
        
        <div style="margin-top: 60px; text-align: center;">
          <p>_________________________________</p>
          <p>Assinatura</p>
        </div>
      `;
    }
    
    const filename = `Recibo_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadPDF(content, filename);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error("Erro ao gerar recibo:", error);
    throw error;
  }
};

// Gerador de PDF para Nota de Serviço
export const generateServiceNotePDF = async (transaction: any, template?: any) => {
  try {
    console.log("=== GERANDO PDF NOTA DE SERVIÇO ===");
    
    let content = '';
    
    if (template && template.content) {
      // Extract products from description for value breakdown
      let products = [];
      let serviceValue = parseFloat(transaction.amount.toString());
      let productValue = 0;
      
      try {
        if (transaction.description && transaction.description.includes('[{')) {
          const jsonMatch = transaction.description.match(/\[{[\s\S]*}\]/);
          if (jsonMatch) {
            products = JSON.parse(jsonMatch[0]);
            productValue = products.reduce((sum: number, product: any) => sum + (product.price || product.amount || 0), 0);
            serviceValue = serviceValue - productValue;
          }
        }
      } catch (e) {
        console.log("Erro ao extrair produtos:", e);
      }
      
      // Generate breakdown table
      let breakdownTable = '';
      if (products.length > 0 || serviceValue > 0) {
        breakdownTable = '<table style="width: 100%; border-collapse: collapse;">';
        
        if (serviceValue > 0) {
          breakdownTable += `
            <tr style="background-color: #e3f2fd;">
              <td style="padding: 10px; border: 1px solid #2563eb; font-weight: bold;">Serviço (Mão de Obra)</td>
              <td style="padding: 10px; border: 1px solid #2563eb; text-align: right; font-weight: bold;">R$ ${serviceValue.toFixed(2).replace('.', ',')}</td>
            </tr>
          `;
        }
        
        if (products.length > 0) {
          products.forEach((product: any) => {
            breakdownTable += `
              <tr style="background-color: #f0fdf4;">
                <td style="padding: 10px; border: 1px solid #16a34a;">${product.name}</td>
                <td style="padding: 10px; border: 1px solid #16a34a; text-align: right; font-weight: bold;">R$ ${(product.price || product.amount || 0).toFixed(2).replace('.', ',')}</td>
              </tr>
            `;
          });
        }
        
        breakdownTable += `
          <tr style="background-color: #f8f9fa; border-top: 2px solid #333;">
            <td style="padding: 12px; font-weight: bold; font-size: 16px;">TOTAL</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #2563eb;">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</td>
          </tr>
        `;
        breakdownTable += '</table>';
      }

      const templateData = {
        empresa_nome: 'Apoiotec Informática',
        empresa_cnpj: '00.000.000/0001-00',
        empresa_endereco: 'Rua da Tecnologia, 123 - Centro',
        empresa_telefone: '(11) 99999-9999',
        empresa_email: 'contato@apoiotec.com.br',
        cliente_nome: transaction.client?.name || 'Cliente',
        cliente_telefone: transaction.client?.phone || 'Não informado',
        cliente_email: transaction.client?.email || 'Não informado',
        data: new Date().toLocaleDateString('pt-BR'),
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        descricao: getCleanDescription(transaction.description || 'Serviço executado'),
        servico_descricao: getCleanDescription(transaction.description || 'Serviço executado'),
        valor: `R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}`,
        valor_total: `R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}`,
        tabela_discriminacao: breakdownTable,
        resolution: transaction.resolution || 'Serviço concluído com êxito',
        numero_nota: transaction.id.toString(),
        imagem: '' // Placeholder para imagem se necessário
      };
      
      content = replaceTemplateVariables(template.content, templateData);
    } else {
      content = `
        <div class="header">
          <h1>NOTA DE SERVIÇO #${transaction.id}</h1>
          <p>Apoiotec Informática</p>
        </div>
        
        <div class="company-info">
          <strong>Apoiotec Informática</strong><br>
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro<br>
          Telefone: (11) 99999-9999<br>
          Email: contato@apoiotec.com.br
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Cliente</h3>
          <p><strong>Nome:</strong> ${transaction.client?.name || 'Cliente'}</p>
          <p><strong>Telefone:</strong> ${transaction.client?.phone || 'N/A'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Serviço Executado</h3>
          <p><strong>Descrição:</strong> ${transaction.description || 'Serviço executado'}</p>
          ${transaction.resolution ? `<p><strong>Resolução:</strong> ${transaction.resolution}</p>` : ''}
        </div>
        
        <div class="total">
          <p>VALOR DO SERVIÇO: R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</p>
        </div>
        
        <div style="margin-top: 60px; text-align: center;">
          <p>_________________________________</p>
          <p>Técnico Responsável</p>
          <p>Apoiotec Informática</p>
        </div>
      `;
    }
    
    const filename = `NotaServico_${transaction.id}_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
    downloadPDF(content, filename);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error("Erro ao gerar nota de serviço:", error);
    throw error;
  }
};

export default {
  generateFinancialReportPDF,
  generateQuotePDF,
  generateReceiptPDF,
  generateServiceNotePDF
};