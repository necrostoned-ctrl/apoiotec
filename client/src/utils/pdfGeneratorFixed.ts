// Gerador de PDF profissional para todos os documentos do sistema
export const generatePDF = (inputData: any, templateType: string = 'recibo') => {
  console.log("=== GERADOR DE PDF PROFISSIONAL ===");
  console.log("Tipo:", templateType);
  console.log("Dados:", inputData);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Erro: Popup bloqueado. Permita popups para este site.');
    return false;
  }

  // Extrair dados principais com valores padrão
  const {
    empresa_nome = 'APOIOTEC INFORMÁTICA',
    empresa_cnpj = '00.000.000/0001-00',
    empresa_endereco = 'Rua da Tecnologia, 123 - Centro',
    empresa_telefone = '(11) 99999-9999',
    empresa_email = 'contato@apoiotec.com.br',
    cliente_nome = 'Cliente',
    cliente_telefone = '',
    descricao = 'Serviço',
    valor = '0,00',
    dataAtual = new Date().toLocaleDateString('pt-BR'),
    tabela_transacoes = '',
    resolution = '',
    amount = 0,
    items = [],
    totalValue = 0
  } = inputData;

  // Formatar valor se necessário
  const valorFormatado = typeof valor === 'number' ? 
    valor.toFixed(2).replace('.', ',') : 
    (amount ? amount.toFixed(2).replace('.', ',') : valor);

  let content = '';

  // Processar items se existirem
  let itemsTable = '';
  if (items && items.length > 0) {
    itemsTable = `
      <div class="items-section">
        <h3>ITENS DO ORÇAMENTO</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.description || item.name || 'Item'}</td>
                <td>R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Template baseado no tipo com layout profissional
  if (templateType === 'recibo') {
    content = `
      <div class="document">
        <div class="header">
          <div class="company-info">
            <h1>${empresa_nome}</h1>
            <p><strong>CNPJ:</strong> ${empresa_cnpj}</p>
            <p><strong>Endereço:</strong> ${empresa_endereco}</p>
            <p><strong>Telefone:</strong> ${empresa_telefone}</p>
            <p><strong>Email:</strong> ${empresa_email}</p>
          </div>
          <h2>RECIBO DE PAGAMENTO</h2>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p><strong>Data:</strong> ${dataAtual}</p>
          </div>
          
          <div class="client-section">
            <h3>DADOS DO CLIENTE</h3>
            <p><strong>Nome:</strong> ${cliente_nome}</p>
            ${cliente_telefone ? `<p><strong>Telefone:</strong> ${cliente_telefone}</p>` : ''}
          </div>
          
          <div class="service-section">
            <h3>SERVIÇO</h3>
            <p><strong>Descrição:</strong> ${descricao}</p>
            ${resolution ? `<p><strong>Resolução:</strong> ${resolution}</p>` : ''}
          </div>
          
          <div class="value-section">
            <h3>VALOR</h3>
            <p class="amount">R$ ${valorFormatado}</p>
          </div>
          
          <div class="signature">
            <p>_____________________________</p>
            <p>Assinatura do Responsável</p>
          </div>
        </div>
      </div>
    `;
  } else if (templateType === 'orcamento') {
    content = `
      <div class="document">
        <div class="header">
          <div class="company-info">
            <h1>${empresa_nome}</h1>
            <p><strong>CNPJ:</strong> ${empresa_cnpj}</p>
            <p><strong>Endereço:</strong> ${empresa_endereco}</p>
            <p><strong>Telefone:</strong> ${empresa_telefone}</p>
            <p><strong>Email:</strong> ${empresa_email}</p>
          </div>
          <h2>ORÇAMENTO</h2>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p><strong>Data:</strong> ${dataAtual}</p>
          </div>
          
          <div class="client-section">
            <h3>DADOS DO CLIENTE</h3>
            <p><strong>Nome:</strong> ${cliente_nome}</p>
            ${cliente_telefone ? `<p><strong>Telefone:</strong> ${cliente_telefone}</p>` : ''}
          </div>
          
          <div class="service-section">
            <h3>SERVIÇO SOLICITADO</h3>
            <p><strong>Descrição:</strong> ${descricao}</p>
          </div>
          
          ${itemsTable}
          
          <div class="value-section">
            <h3>VALOR TOTAL</h3>
            <p class="amount">R$ ${totalValue > 0 ? totalValue.toFixed(2).replace('.', ',') : valorFormatado}</p>
          </div>
          
          <div class="signature">
            <p>_____________________________</p>
            <p>Responsável Técnico</p>
          </div>
        </div>
      </div>
    `;
  } else if (templateType === 'nota_servico') {
    content = `
      <div class="document">
        <div class="header">
          <div class="company-info">
            <h1>${empresa_nome}</h1>
            <p><strong>CNPJ:</strong> ${empresa_cnpj}</p>
            <p><strong>Endereço:</strong> ${empresa_endereco}</p>
            <p><strong>Telefone:</strong> ${empresa_telefone}</p>
            <p><strong>Email:</strong> ${empresa_email}</p>
          </div>
          <h2>NOTA DE SERVIÇO</h2>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p><strong>Data:</strong> ${dataAtual}</p>
          </div>
          
          <div class="client-section">
            <h3>DADOS DO CLIENTE</h3>
            <p><strong>Nome:</strong> ${cliente_nome}</p>
            ${cliente_telefone ? `<p><strong>Telefone:</strong> ${cliente_telefone}</p>` : ''}
          </div>
          
          <div class="service-section">
            <h3>SERVIÇO EXECUTADO</h3>
            <p><strong>Descrição:</strong> ${descricao}</p>
            ${resolution ? `<p><strong>Resolução:</strong> ${resolution}</p>` : ''}
          </div>
          
          <div class="value-section">
            <h3>VALOR DO SERVIÇO</h3>
            <p class="amount">R$ ${valorFormatado}</p>
          </div>
          
          <div class="signature">
            <p>_____________________________</p>
            <p>Responsável Técnico</p>
          </div>
        </div>
      </div>
    `;
  } else if (templateType === 'relatorio') {
    content = `
      <div class="document">
        <div class="header">
          <div class="company-info">
            <h1>${empresa_nome}</h1>
            <p><strong>CNPJ:</strong> ${empresa_cnpj}</p>
            <p><strong>Endereço:</strong> ${empresa_endereco}</p>
            <p><strong>Telefone:</strong> ${empresa_telefone}</p>
            <p><strong>Email:</strong> ${empresa_email}</p>
          </div>
          <h2>RELATÓRIO FINANCEIRO</h2>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p><strong>Período:</strong> ${dataAtual}</p>
          </div>
          
          <div class="report-section">
            ${tabela_transacoes || `
              <div class="transaction-summary">
                <h3>RESUMO FINANCEIRO</h3>
                <p>${descricao}</p>
                <p class="total-amount">TOTAL: R$ ${valorFormatado}</p>
              </div>
            `}
          </div>
          
          <div class="footer-info">
            <p><strong>Data do Relatório:</strong> ${dataAtual}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Criar página HTML profissional
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${templateType.toUpperCase()} - APOIOTEC</title>
      <style>
        @media print {
          body { margin: 0; }
          .document { page-break-after: always; box-shadow: none; }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
          color: #333;
        }
        
        .document {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          border-radius: 8px;
        }
        
        .header {
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #0066cc;
        }
        
        .company-info {
          text-align: left;
          margin-bottom: 20px;
        }
        
        .company-info h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #0066cc;
          font-weight: bold;
          letter-spacing: 1px;
        }
        
        .company-info p {
          margin: 5px 0;
          font-size: 14px;
          color: #666;
        }
        
        .header h2 {
          text-align: center;
          margin: 20px 0 0 0;
          font-size: 24px;
          color: #0066cc;
          font-weight: bold;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          border: 2px solid #0066cc;
        }
        
        .content {
          line-height: 1.6;
          font-size: 16px;
        }
        
        .info-section,
        .client-section,
        .service-section,
        .value-section,
        .report-section {
          margin-bottom: 30px;
        }
        
        .client-section h3,
        .service-section h3,
        .value-section h3,
        .report-section h3 {
          color: #0066cc;
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .value-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          border-left: 5px solid #0066cc;
        }
        
        .amount,
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin: 10px 0;
        }
        
        .signature {
          text-align: center;
          margin-top: 60px;
          padding-top: 30px;
        }
        
        .signature p {
          margin: 5px 0;
        }
        
        .transaction-summary {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 5px;
          border-left: 5px solid #0066cc;
        }
        
        strong {
          color: #0066cc;
        }
        
        p {
          margin: 8px 0;
        }
        
        .footer-info {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
        }
        
        .items-section {
          margin: 30px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        
        .items-table th {
          background: #0066cc;
          color: white;
          font-weight: bold;
        }
        
        .items-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .items-table tr:hover {
          background: #e9ecef;
        }
        
        .transactions-section {
          margin: 30px 0;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .summary-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border-left: 5px solid #0066cc;
        }
        
        .summary-card.entrada {
          border-left-color: #28a745;
          background: linear-gradient(135deg, #f8fff9, #e6f7e6);
        }
        
        .summary-card.saida {
          border-left-color: #dc3545;
          background: linear-gradient(135deg, #fff8f8, #f7e6e6);
        }
        
        .summary-card.saldo.positivo {
          border-left-color: #28a745;
          background: linear-gradient(135deg, #f0fff4, #d4edda);
        }
        
        .summary-card.saldo.negativo {
          border-left-color: #dc3545;
          background: linear-gradient(135deg, #fff5f5, #f8d7da);
        }
        
        .summary-card h4 {
          margin: 0 0 10px 0;
          color: #0066cc;
          font-size: 16px;
          font-weight: bold;
        }
        
        .amount-large {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
          color: #0066cc;
        }
        
        .summary-card.entrada .amount-large {
          color: #28a745;
        }
        
        .summary-card.saida .amount-large {
          color: #dc3545;
        }
        
        .summary-card.saldo.positivo .amount-large {
          color: #28a745;
        }
        
        .summary-card.saldo.negativo .amount-large {
          color: #dc3545;
        }
        
        .count {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #666;
        }
        
        .financial-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
        }
        
        .financial-table th,
        .financial-table td {
          padding: 12px 8px;
          text-align: left;
          border: 1px solid #ddd;
        }
        
        .financial-table th {
          background: #0066cc;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        .transaction-row.entrada {
          background: #f8fff9;
        }
        
        .transaction-row.saida {
          background: #fff8f8;
        }
        
        .tipo-entrada {
          color: #28a745;
          font-weight: bold;
        }
        
        .tipo-saida {
          color: #dc3545;
          font-weight: bold;
        }
        
        .valor-entrada {
          color: #28a745;
          font-weight: bold;
        }
        
        .valor-saida {
          color: #dc3545;
          font-weight: bold;
        }
        
        .status-pago {
          color: #28a745;
          background: #d4edda;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .status-pendente {
          color: #856404;
          background: #fff3cd;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .status-parcial {
          color: #0c5460;
          background: #d1ecf1;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Aguardar um pouco antes de imprimir para garantir carregamento
  setTimeout(() => {
    printWindow.print();
  }, 500);

  return true;
};

// Funções específicas para cada tipo de documento
export const generateReceiptPDF = (transaction: any) => {
  return generatePDF({
    cliente_nome: transaction.client?.name || 'Cliente',
    cliente_telefone: transaction.client?.phone || '',
    descricao: transaction.description || 'Serviço',
    valor: transaction.amount || 0,
    resolution: transaction.resolution || '',
    dataAtual: new Date().toLocaleDateString('pt-BR')
  }, 'recibo');
};

export const generateQuotePDF = (quote: any) => {
  // Processar items do orçamento
  let items = [];
  let totalValue = 0;
  
  try {
    if (quote.items) {
      items = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
      totalValue = items.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.amount || item.price || 0);
      }, 0);
    }
  } catch (e) {
    console.log('Erro ao processar items do orçamento:', e);
  }

  return generatePDF({
    cliente_nome: quote.client?.name || 'Cliente',
    cliente_telefone: quote.client?.phone || '',
    descricao: quote.title || quote.description || 'Serviço',
    valor: totalValue > 0 ? totalValue.toFixed(2).replace('.', ',') : (quote.totalValue || quote.amount || 0),
    dataAtual: new Date().toLocaleDateString('pt-BR'),
    items: items,
    totalValue: totalValue
  }, 'orcamento');
};

export const generateServiceNotePDF = (transaction: any) => {
  return generatePDF({
    cliente_nome: transaction.client?.name || 'Cliente',
    cliente_telefone: transaction.client?.phone || '',
    descricao: transaction.description || 'Serviço',
    valor: transaction.amount || 0,
    resolution: transaction.resolution || '',
    dataAtual: new Date().toLocaleDateString('pt-BR')
  }, 'nota_servico');
};

export const generateFinancialReport = (transactions: any[], filters: any = {}) => {
  console.log("=== INICIANDO GERAÇÃO DE RELATÓRIO FINANCEIRO ===");
  console.log("Transações recebidas:", transactions.length);
  
  const empresa_nome = 'APOIOTEC INFORMÁTICA';
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  // Calcular totais
  const entradas = transactions.filter(t => t.type === 'entrada');
  const saidas = transactions.filter(t => t.type === 'saida');
  const totalEntradas = entradas.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const saldo = totalEntradas - totalSaidas;

  console.log("Estatísticas calculadas:", { 
    totalEntradas, 
    totalSaidas, 
    saldo, 
    quantidadeTransacoes: transactions.length 
  });

  // Criar tabela de transações melhorada
  let tabela_transacoes = `
    <div class="transactions-section">
      <h3>MOVIMENTAÇÕES FINANCEIRAS</h3>
      <div class="summary-cards">
        <div class="summary-card entrada">
          <h4>ENTRADAS</h4>
          <p class="amount-large">R$ ${totalEntradas.toFixed(2).replace('.', ',')}</p>
          <p class="count">${entradas.length} transações</p>
        </div>
        <div class="summary-card saida">
          <h4>SAÍDAS</h4>
          <p class="amount-large">R$ ${totalSaidas.toFixed(2).replace('.', ',')}</p>
          <p class="count">${saidas.length} transações</p>
        </div>
        <div class="summary-card saldo ${saldo >= 0 ? 'positivo' : 'negativo'}">
          <h4>SALDO FINAL</h4>
          <p class="amount-large">R$ ${saldo.toFixed(2).replace('.', ',')}</p>
          <p class="count">${saldo >= 0 ? 'Positivo' : 'Negativo'}</p>
        </div>
      </div>
      
      <div class="transactions-table">
        <h4>DETALHAMENTO DAS TRANSAÇÕES</h4>
        <table class="financial-table">
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
  `;

  transactions.forEach((transaction: any) => {
    const tipo = transaction.type === 'entrada' ? 'Entrada' : 'Saída';
    const tipoClass = transaction.type === 'entrada' ? 'entrada' : 'saida';
    
    tabela_transacoes += `
      <tr class="transaction-row ${tipoClass}">
        <td>${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</td>
        <td>${transaction.description || 'Sem descrição'}</td>
        <td>${transaction.client?.name || 'Cliente não informado'}</td>
        <td class="tipo-${tipoClass}">${tipo}</td>
        <td class="status-${transaction.status || 'pendente'}">${transaction.status || 'Pendente'}</td>
        <td class="valor-${tipoClass}">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  });

  tabela_transacoes += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  console.log("Chamando generatePDF para relatório...");
  
  return generatePDF({
    empresa_nome,
    empresa_cnpj: '00.000.000/0001-00',
    empresa_endereco: 'Rua da Tecnologia, 123 - Centro',
    empresa_telefone: '(11) 99999-9999',
    empresa_email: 'contato@apoiotec.com.br',
    dataAtual,
    tabela_transacoes,
    valor: saldo.toFixed(2).replace('.', ','),
    descricao: `Relatório Financeiro - ${transactions.length} transações processadas`
  }, 'relatorio');
};