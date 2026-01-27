// Sistema de PDF simples e funcional

// Função para gerar PDF real usando window.print
const generateRealPDF = (content: string, filename: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }
};

// Função principal para gerar PDF
export const generatePDF = async (data: any, templateType: string) => {
  console.log(`=== GERANDO PDF: ${templateType.toUpperCase()} ===`);
  console.log("Dados recebidos:", data);

  let content = '';

  // Criar conteúdo baseado no tipo
  if (templateType === 'recibo') {
    content = createReceiptContent(data);
  } else if (templateType === 'orcamento') {
    content = createQuoteContent(data);
  } else if (templateType === 'nota_servico') {
    content = createServiceNoteContent(data);
  } else if (templateType === 'relatorio') {
    content = createReportContent(data);
  }

  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: white; }
      .document { max-width: 800px; margin: 0 auto; padding: 40px; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 20px; }
      .company-name { color: #0066cc; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
      .company-info { font-size: 14px; color: #666; margin: 5px 0; }
      .document-title { color: #0066cc; font-size: 24px; font-weight: bold; margin: 20px 0; text-align: center; }
      .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9; }
      .section-title { color: #0066cc; font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #0066cc; padding-bottom: 5px; }
      .amount { font-size: 24px; font-weight: bold; color: #0066cc; text-align: center; margin: 20px 0; padding: 15px; border: 2px solid #0066cc; border-radius: 5px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
      th { background: #0066cc; color: white; }
      tr:nth-child(even) { background: #f9f9f9; }
      .signature { margin-top: 50px; text-align: center; }
      .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
      .summary-card { padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #ddd; }
      .summary-card.entrada { border-color: #22c55e; background: #f0fdf4; }
      .summary-card.saida { border-color: #ef4444; background: #fef2f2; }
      .summary-card.saldo { border-color: #0066cc; background: #f0f8ff; }
      .summary-card h4 { font-size: 14px; margin-bottom: 10px; color: #666; }
      .summary-card .amount-large { font-size: 20px; font-weight: bold; margin: 5px 0; }
      .summary-card.entrada .amount-large { color: #22c55e; }
      .summary-card.saida .amount-large { color: #ef4444; }
      .summary-card.saldo .amount-large { color: #0066cc; }
    </style>
  `;

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Documento</title>${styles}</head><body>${content}</body></html>`;

  const filename = `${templateType}_${new Date().toISOString().slice(0, 10)}.pdf`;
  generateRealPDF(fullHtml, filename);
  
  console.log(`PDF ${templateType} gerado!`);
};

// Template para recibo
const createReceiptContent = (data: any) => {
  const valor = data.valor || data.amount || '0,00';
  
  return `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">CNPJ: 00.000.000/0001-00</div>
        <div class="company-info">Rua da Tecnologia, 123 - Centro - São Paulo/SP</div>
        <div class="company-info">Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br</div>
      </div>
      
      <div class="document-title">RECIBO</div>
      
      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <p><strong>Nome:</strong> ${data.cliente_nome || 'Cliente'}</p>
        ${data.cliente_telefone ? `<p><strong>Telefone:</strong> ${data.cliente_telefone}</p>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">SERVIÇO</div>
        <p><strong>Descrição:</strong> ${data.descricao || 'Serviço'}</p>
        ${data.resolution ? `<p><strong>Resolução:</strong> ${data.resolution}</p>` : ''}
      </div>
      
      <div class="amount">R$ ${valor}</div>
      
      <div class="section">
        <p><strong>Data:</strong> ${data.dataAtual || new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="signature">
        <p>_____________________________</p>
        <p>APOIOTEC INFORMÁTICA</p>
      </div>
    </div>
  `;
};

// Template para orçamento
const createQuoteContent = (data: any) => {
  const valor = data.valor || data.totalValue || data.amount || '0,00';
  
  return `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">CNPJ: 00.000.000/0001-00</div>
        <div class="company-info">Rua da Tecnologia, 123 - Centro - São Paulo/SP</div>
        <div class="company-info">Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br</div>
      </div>
      
      <div class="document-title">ORÇAMENTO</div>
      
      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <p><strong>Nome:</strong> ${data.cliente_nome || 'Cliente'}</p>
        ${data.cliente_telefone ? `<p><strong>Telefone:</strong> ${data.cliente_telefone}</p>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">SERVIÇO</div>
        <p><strong>Descrição:</strong> ${data.descricao || 'Serviço'}</p>
        
        ${data.items && data.items.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Preço Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map((item: any) => `
                <tr>
                  <td>${item.name || item.description}</td>
                  <td>${item.quantity || 1}</td>
                  <td>R$ ${item.price || '0,00'}</td>
                  <td>R$ ${item.total || '0,00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
      
      <div class="amount">VALOR TOTAL: R$ ${valor}</div>
      
      <div class="section">
        <p><strong>Data:</strong> ${data.dataAtual || new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Validade:</strong> 30 dias</p>
      </div>
      
      <div class="footer">
        <p>Orçamento válido por 30 dias a partir da data de emissão</p>
      </div>
    </div>
  `;
};

// Template para nota de serviço
const createServiceNoteContent = (data: any) => {
  const valor = data.valor || data.amount || '0,00';
  
  return `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">CNPJ: 00.000.000/0001-00</div>
        <div class="company-info">Rua da Tecnologia, 123 - Centro - São Paulo/SP</div>
        <div class="company-info">Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br</div>
      </div>
      
      <div class="document-title">NOTA DE SERVIÇO</div>
      
      <div class="section">
        <div class="section-title">DADOS DO CLIENTE</div>
        <p><strong>Nome:</strong> ${data.cliente_nome || 'Cliente'}</p>
        ${data.cliente_telefone ? `<p><strong>Telefone:</strong> ${data.cliente_telefone}</p>` : ''}
      </div>
      
      <div class="section">
        <div class="section-title">SERVIÇO EXECUTADO</div>
        <p><strong>Descrição:</strong> ${data.descricao || 'Serviço'}</p>
        ${data.resolution ? `<p><strong>Resolução:</strong> ${data.resolution}</p>` : ''}
      </div>
      
      <div class="amount">R$ ${valor}</div>
      
      <div class="section">
        <p><strong>Data:</strong> ${data.dataAtual || new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="signature">
        <p>_____________________________</p>
        <p>Responsável Técnico</p>
      </div>
    </div>
  `;
};

// Template para relatório financeiro
const createReportContent = (data: any) => {
  return `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">CNPJ: 00.000.000/0001-00</div>
        <div class="company-info">Rua da Tecnologia, 123 - Centro - São Paulo/SP</div>
        <div class="company-info">Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br</div>
      </div>
      
      <div class="document-title">RELATÓRIO FINANCEIRO</div>
      
      <div class="section">
        <p><strong>Período:</strong> ${data.dataAtual || new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      ${data.tabela_transacoes || `
        <div class="section">
          <div class="section-title">RESUMO FINANCEIRO</div>
          <div class="summary-cards">
            <div class="summary-card entrada">
              <h4>ENTRADAS</h4>
              <p class="amount-large">R$ 0,00</p>
            </div>
            <div class="summary-card saida">
              <h4>SAÍDAS</h4>
              <p class="amount-large">R$ 0,00</p>
            </div>
            <div class="summary-card saldo">
              <h4>SALDO</h4>
              <p class="amount-large">R$ 0,00</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">TRANSAÇÕES</div>
          <p>Nenhuma transação encontrada para o período selecionado.</p>
        </div>
      `}
      
      <div class="footer">
        <p>Relatório gerado automaticamente pelo sistema APOIOTEC</p>
      </div>
    </div>
  `;
};

// Funções específicas para cada tipo
export const generateReceiptPDF = (data: any) => {
  console.log("=== GERANDO RECIBO ===");
  console.log("Data received:", data);
  
  const receiptData = {
    cliente_nome: data.client?.name || data.cliente_nome || 'Cliente',
    cliente_telefone: data.client?.phone || data.cliente_telefone || '',
    cliente_email: data.client?.email || data.cliente_email || '',
    descricao: data.description || data.descricao || 'Serviço prestado',
    valor: data.amount ? parseFloat(data.amount).toFixed(2).replace('.', ',') : (data.valor || '0,00'),
    resolution: data.resolution || '',
    dataAtual: new Date().toLocaleDateString('pt-BR')
  };
  
  console.log("Receipt data processed:", receiptData);
  
  return generatePDF(receiptData, 'recibo');
};

export const generateQuotePDF = (quote: any) => {
  const items = quote.items || [];
  const totalValue = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0);
  
  return generatePDF({
    cliente_nome: quote.client?.name || 'Cliente',
    cliente_telefone: quote.client?.phone || '',
    descricao: quote.title || quote.description || 'Serviço',
    valor: totalValue > 0 ? totalValue.toFixed(2).replace('.', ',') : (quote.totalValue || quote.amount || 0),
    dataAtual: new Date().toLocaleDateString('pt-BR'),
    items: items
  }, 'orcamento');
};

export const generateServiceNotePDF = (transaction: any) => {
  console.log("=== GERANDO NOTA DE SERVIÇO ===");
  console.log("Transaction data:", transaction);
  
  const valor = parseFloat(transaction.amount || 0).toFixed(2).replace('.', ',');
  
  const data = {
    cliente_nome: transaction.client?.name || 'Cliente',
    cliente_telefone: transaction.client?.phone || '',
    descricao: transaction.description || 'Serviço',
    valor: valor,
    resolution: transaction.resolution || '',
    dataAtual: new Date().toLocaleDateString('pt-BR')
  };
  
  console.log("PDF data:", data);
  
  return generatePDF(data, 'nota_servico');
};

export const generateFinancialReport = (transactions: any[]) => {
  console.log("=== RELATÓRIO FINANCEIRO SIMPLES ===");
  
  // Calcular totais
  const entradas = transactions.filter(t => t.type === 'entrada');
  const saidas = transactions.filter(t => t.type === 'saida');
  const totalEntradas = entradas.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const saldo = totalEntradas - totalSaidas;

  console.log("Totais:", { totalEntradas, totalSaidas, saldo });

  // Criar tabela de transações
  const tabelaTransacoes = `
    <div class="section">
      <div class="section-title">RESUMO FINANCEIRO</div>
      <div class="summary-cards">
        <div class="summary-card entrada">
          <h4>ENTRADAS</h4>
          <p class="amount-large">R$ ${totalEntradas.toFixed(2).replace('.', ',')}</p>
          <p>${entradas.length} transações</p>
        </div>
        <div class="summary-card saida">
          <h4>SAÍDAS</h4>
          <p class="amount-large">R$ ${totalSaidas.toFixed(2).replace('.', ',')}</p>
          <p>${saidas.length} transações</p>
        </div>
        <div class="summary-card saldo">
          <h4>SALDO FINAL</h4>
          <p class="amount-large">R$ ${saldo.toFixed(2).replace('.', ',')}</p>
          <p>${saldo >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">DETALHAMENTO DAS TRANSAÇÕES</div>
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
              <td>${transaction.description || 'Sem descrição'}</td>
              <td>${transaction.type === 'entrada' ? 'Entrada' : 'Saída'}</td>
              <td>R$ ${parseFloat(transaction.amount).toFixed(2).replace('.', ',')}</td>
              <td>${transaction.status || 'Pendente'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const reportData = {
    dataAtual: new Date().toLocaleDateString('pt-BR'),
    tabela_transacoes: tabelaTransacoes,
    total_entradas: totalEntradas.toFixed(2).replace('.', ','),
    total_saidas: totalSaidas.toFixed(2).replace('.', ','),
    saldo_final: saldo.toFixed(2).replace('.', ',')
  };
  
  console.log("Report data:", reportData);
  
  return generatePDF(reportData, 'relatorio');
};

// Função interna para usar nos exports
const generatePDFInternal = async (data: any, templateType: string) => {
  try {
    console.log(`=== GERANDO PDF ${templateType.toUpperCase()} ===`);
    console.log("Data:", data);

    // Gerar conteúdo HTML baseado no tipo
    let htmlContent = '';
    
    switch (templateType) {
      case 'recibo':
        htmlContent = createReceiptContent(data);
        break;
      case 'orcamento':
        htmlContent = createQuoteContent(data);
        break;
      case 'nota_servico':
        htmlContent = createServiceNoteContent(data);
        break;
      case 'relatorio':
        htmlContent = createReportContent(data);
        break;
      default:
        throw new Error(`Tipo de template não suportado: ${templateType}`);
    }

    console.log("HTML gerado, iniciando download...");

    // Gerar e baixar PDF
    const filename = `${templateType}_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadPDF(htmlContent, filename);

    console.log("PDF gerado com sucesso!");

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};

// Função para baixar PDF
const downloadPDF = (htmlContent: string, filename: string) => {
  console.log("=== BAIXANDO PDF ===");
  console.log("Filename:", filename);
  
  // Criar nova janela para impressão
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error("Não foi possível abrir janela de impressão");
  }

  // Escrever HTML na nova janela
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          ${getDocumentStyles()}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Aguardar carregamento e executar impressão
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

// Estilos CSS para os documentos
const getDocumentStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }

  .document {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    text-align: left;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #0066cc;
  }

  .company-name {
    font-size: 24px;
    font-weight: bold;
    color: #0066cc;
    margin-bottom: 10px;
  }

  .company-info {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
  }

  .document-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin: 30px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
  }

  .section {
    margin-bottom: 25px;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #0066cc;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #dee2e6;
  }

  .amount {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    color: #0066cc;
    margin: 30px 0;
    padding: 20px;
    border: 2px solid #0066cc;
    background-color: #f8f9fa;
  }

  .amount-large {
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }

  th, td {
    border: 1px solid #dee2e6;
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
    color: #495057;
  }

  .summary-cards {
    display: flex;
    gap: 20px;
    margin: 20px 0;
  }

  .summary-card {
    flex: 1;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    text-align: center;
  }

  .summary-card.entrada {
    background-color: #d4edda;
    border-color: #c3e6cb;
  }

  .summary-card.saida {
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }

  .summary-card.saldo {
    background-color: #d1ecf1;
    border-color: #bee5eb;
  }

  .signature {
    margin-top: 50px;
    text-align: center;
  }

  .footer {
    margin-top: 40px;
    text-align: center;
    font-size: 12px;
    color: #666;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
  }

  @media print {
    .document {
      margin: 0;
      padding: 0;
      max-width: none;
    }
    
    .summary-cards {
      display: block;
    }
    
    .summary-card {
      margin-bottom: 10px;
      break-inside: avoid;
    }
  }
`;