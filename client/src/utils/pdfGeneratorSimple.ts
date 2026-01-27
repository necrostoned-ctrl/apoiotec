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

// Função para baixar PDF
const downloadPDF = (htmlContent: string, filename: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error("Não foi possível abrir janela de impressão");
  }

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
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    margin: 10px;
  }

  .document {
    max-width: 100%;
    margin: 0;
    padding: 20px;
  }

  .header {
    text-align: left;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #0066cc;
  }

  .company-name {
    font-size: 18px;
    font-weight: bold;
    color: #0066cc;
    margin-bottom: 5px;
  }

  .company-info {
    color: #666;
    font-size: 10px;
    line-height: 1.2;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 11px;
  }

  th, td {
    padding: 6px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  .total-row {
    font-weight: bold;
    background-color: #f9f9f9;
  }

  .signature-area {
    margin-top: 50px;
    text-align: center;
  }

  .signature-line {
    width: 300px;
    height: 1px;
    background-color: #333;
    margin: 0 auto 10px;
  }

  @media print {
    body {
      margin: 0;
      padding: 20px;
    }
    
    .document {
      margin: 0;
      padding: 0;
    }
  }
`;

// Função para extrair produtos da descrição
const extractProductsFromDescription = (description: string) => {
  if (!description) return [];
  
  const lines = description.split('\n').filter((line: any) => line.trim());
  const products: any[] = [];
  
  lines.forEach((line: any) => {
    // Procurar por produtos com valor
    const match = line.match(/([^:]+):\s*R\$\s*(\d+(?:,\d{2})?)/);
    if (match) {
      const name = match[1].trim();
      const value = parseFloat(match[2].replace(',', '.'));
      if (name && !isNaN(value)) {
        products.push({ name, value });
      }
    }
  });
  
  console.log("Produtos extraídos:", products);
  return products;
};

// Função simples para gerar PDFs de recibo
export const generateReceiptPDF = (transaction: any) => {
  console.log("=== GERANDO RECIBO PDF ===");
  console.log("Transação recebida:", transaction);
  
  // Extrair valores de produtos da descrição
  const productMatches = extractProductsFromDescription(transaction.description);
  console.log("Produtos extraídos:", productMatches);
  
  // Calcular valor do serviço (valor total - valor dos produtos)
  const totalAmount = parseFloat(transaction.amount);
  const productValue = productMatches.reduce((sum: any, match: any) => sum + match.value, 0);
  const serviceValue = totalAmount - productValue;
  
  console.log("Valor total:", totalAmount);
  console.log("Valor dos produtos:", productValue);
  console.log("Valor do serviço:", serviceValue);

  const htmlContent = `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro - São Paulo/SP<br>
          Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br
        </div>
      </div>
      
      <h2 style="text-align: center; color: #0066cc; margin-bottom: 30px;">RECIBO</h2>
      
      <div style="margin-bottom: 20px;">
        <strong>Cliente:</strong> ${transaction.client?.name || 'N/A'}<br>
        <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
        <strong>Recibo Nº:</strong> ${transaction.id}
      </div>
      
      <div style="margin: 20px 0;">
        <strong>Descrição do Serviço:</strong><br>
        ${getCleanDescription(transaction.description || 'Serviço prestado')}
      </div>
      
      ${serviceValue > 0 ? `
        <div style="background-color: #e3f2fd; border: 2px solid #0066cc; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #0066cc; margin: 0;">Valor do Serviço</h3>
          <div style="font-size: 24px; font-weight: bold; color: #0066cc; margin-top: 10px;">
            R$ ${serviceValue.toFixed(2).replace('.', ',')}
          </div>
        </div>
      ` : ''}
      
      ${productMatches.length > 0 ? `
        <div style="background-color: #e8f5e8; border: 2px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #28a745; margin: 0 0 15px 0;">Valor do(s) Produto(s)</h3>
          ${productMatches.map((product: any) => `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd;">
              <span>${product.name}</span>
              <span style="font-weight: bold;">R$ ${product.value.toFixed(2).replace('.', ',')}</span>
            </div>
          `).join('')}
          <div style="font-size: 18px; font-weight: bold; color: #28a745; margin-top: 15px; text-align: right;">
            Total Produtos: R$ ${productValue.toFixed(2).replace('.', ',')}
          </div>
        </div>
      ` : ''}
      
      <div style="background-color: #f8f9fa; border: 2px solid #333; padding: 20px; margin: 30px 0; text-align: center; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0;">VALOR TOTAL</h3>
        <div style="font-size: 28px; font-weight: bold; color: #333;">
          R$ ${totalAmount.toFixed(2).replace('.', ',')}
        </div>
      </div>
      
      <div class="signature-area">
        <div class="signature-line"></div>
        <p>Assinatura do Responsável</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Este documento foi gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  `;

  downloadPDF(htmlContent, `Recibo_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Função para gerar PDF de orçamento
export const generateQuotePDF = (quote: any) => {
  console.log("=== GERANDO ORÇAMENTO PDF ===");
  console.log("Orçamento recebido:", quote);
  
  // Calcular total dos itens
  let items = [];
  let totalValue = 0;
  
  // Verificar se existe campo total no orçamento
  if (quote.total) {
    totalValue = parseFloat(quote.total);
  }
  
  // Parsear itens se existir
  if (quote.items) {
    try {
      if (typeof quote.items === 'string') {
        items = JSON.parse(quote.items);
      } else {
        items = quote.items;
      }
    } catch (e) {
      console.log("Erro ao parsear itens:", e);
      items = [];
    }
  }
  
  console.log("Total do orçamento:", totalValue);
  console.log("Itens:", items);

  // Separar itens por tipo selecionado na criação do orçamento
  const serviceItems = items.filter((item: any) => item.type === 'servico');
  const productItems = items.filter((item: any) => item.type === 'produto');

  const serviceTotal = serviceItems.reduce((sum: any, item: any) => {
    const itemAmount = parseFloat(item.amount || item.price || 0);
    return sum + itemAmount;
  }, 0);

  const productTotal = productItems.reduce((sum: any, item: any) => {
    const itemAmount = parseFloat(item.amount || item.price || 0);
    return sum + itemAmount;
  }, 0);

  console.log("Valor de serviços:", serviceTotal);
  console.log("Valor de produtos:", productTotal);

  const htmlContent = `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro - São Paulo/SP<br>
          Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br
        </div>
      </div>
      
      <h2 style="text-align: center; color: #0066cc; margin-bottom: 30px;">ORÇAMENTO</h2>
      
      <div style="margin-bottom: 20px;">
        <strong>Cliente:</strong> ${quote.client?.name || 'N/A'}<br>
        <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
        <strong>Orçamento Nº:</strong> ${quote.id}<br>
        <strong>Validade:</strong> 30 dias
      </div>
      
      <div style="margin: 20px 0;">
        <strong>Descrição:</strong><br>
        ${quote.description || quote.title || 'Serviço solicitado'}
      </div>
      
      <!-- Discriminação de Valores por Categoria -->
      <div style="margin: 30px 0;">
        <h3 style="color: #0066cc; margin-bottom: 20px;">DISCRIMINAÇÃO DO ORÇAMENTO</h3>
        
        ${serviceItems.length > 0 ? `
          <div style="background-color: #e3f2fd; border: 2px solid #0066cc; padding: 15px; margin: 15px 0; border-radius: 8px;">
            <h4 style="color: #0066cc; margin: 0 0 15px 0;">🔧 Serviços (Mão de Obra)</h4>
            ${serviceItems.map((item: any) => {
              const itemAmount = parseFloat(item.amount || item.price || 0);
              
              return `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                  <span style="font-weight: 500;">${item.description || item.name || 'Serviço'}</span>
                  <span style="font-weight: bold; color: #0066cc;">R$ ${itemAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              `;
            }).join('')}
            <div style="font-size: 16px; font-weight: bold; color: #0066cc; margin-top: 15px; padding-top: 10px; border-top: 2px solid #0066cc; text-align: right;">
              Subtotal Serviços: R$ ${serviceTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>
        ` : ''}
        
        ${productItems.length > 0 ? `
          <div style="background-color: #e8f5e8; border: 2px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px;">
            <h4 style="color: #28a745; margin: 0 0 15px 0;">⚙️ Produtos/Materiais</h4>
            ${productItems.map((item: any) => {
              const itemAmount = parseFloat(item.amount || item.price || 0);
              
              return `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                  <span style="font-weight: 500;">${item.description || item.name || 'Produto'}</span>
                  <span style="font-weight: bold; color: #28a745;">R$ ${itemAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              `;
            }).join('')}
            <div style="font-size: 16px; font-weight: bold; color: #28a745; margin-top: 15px; padding-top: 10px; border-top: 2px solid #28a745; text-align: right;">
              Subtotal Produtos: R$ ${productTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>
        ` : ''}
        
        ${items.length === 0 ? `
          <div style="background-color: #e3f2fd; border: 2px solid #0066cc; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center;">
            <h4 style="color: #0066cc; margin: 0 0 10px 0;">Serviço Solicitado</h4>
            <div style="font-size: 16px; color: #666;">
              ${quote.description || quote.title || 'Serviço conforme especificação'}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div style="background-color: #f8f9fa; border: 3px solid #333; padding: 20px; margin: 30px 0; text-align: center; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #333;">VALOR TOTAL DO ORÇAMENTO</h3>
        <div style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px;">
          R$ ${totalValue.toFixed(2).replace('.', ',')}
        </div>
        ${serviceTotal > 0 && productTotal > 0 ? `
          <div style="font-size: 14px; color: #666;">
            Serviços: R$ ${serviceTotal.toFixed(2).replace('.', ',')} + Produtos: R$ ${productTotal.toFixed(2).replace('.', ',')}
          </div>
        ` : ''}
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
        <strong>Observações:</strong><br>
        - Orçamento válido por 30 dias<br>
        - Preços sujeitos a alteração sem aviso prévio<br>
        - Serviço executado mediante aprovação do orçamento
      </div>
      
      <div class="signature-area">
        <div class="signature-line"></div>
        <p>Assinatura do Cliente (Aprovação)</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Este documento foi gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  `;

  downloadPDF(htmlContent, `Orcamento_${quote.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Função para gerar nota de serviço
export const generateServiceNotePDF = (transaction: any) => {
  console.log("=== GERANDO NOTA DE SERVIÇO ===");
  console.log("Transação:", transaction);

  // Extrair valores de produtos da descrição
  const productMatches = extractProductsFromDescription(transaction.description);
  console.log("Produtos extraídos para nota de serviço:", productMatches);
  
  // Calcular valor do serviço (valor total - valor dos produtos)
  const totalAmount = parseFloat(transaction.amount);
  const productValue = productMatches.reduce((sum: any, match: any) => sum + match.value, 0);
  const serviceValue = totalAmount - productValue;
  
  console.log("Valor total nota de serviço:", totalAmount);
  console.log("Valor dos produtos:", productValue);
  console.log("Valor do serviço base:", serviceValue);

  const htmlContent = `
    <div class="document">
      <div class="header">
        <div class="company-name">APOIOTEC INFORMÁTICA</div>
        <div class="company-info">
          CNPJ: 00.000.000/0001-00<br>
          Rua da Tecnologia, 123 - Centro - São Paulo/SP<br>
          Telefone: (11) 99999-9999 | Email: contato@apoiotec.com.br
        </div>
      </div>
      
      <h2 style="text-align: center; color: #0066cc; margin-bottom: 30px;">NOTA DE SERVIÇO</h2>
      
      <div style="margin-bottom: 20px;">
        <strong>Cliente:</strong> ${transaction.client?.name || 'N/A'}<br>
        <strong>Data do Serviço:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
        <strong>Nota Nº:</strong> ${transaction.id}
      </div>
      
      <div style="margin: 20px 0;">
        <strong>Descrição do Serviço Executado:</strong><br>
        <div style="border: 1px solid #ddd; padding: 15px; margin-top: 10px; background-color: #f9f9f9;">
          ${getCleanDescription(transaction.description || '').replace(/\n/g, '<br>')}
        </div>
      </div>
      
      ${transaction.resolution ? `
        <div style="margin: 20px 0;">
          <strong>Resolução:</strong><br>
          <div style="border: 1px solid #ddd; padding: 15px; margin-top: 10px; background-color: #e8f5e8;">
            ${transaction.resolution.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}
      
      <!-- Discriminação de valores em layout compacto -->
      <div style="margin: 25px 0;">
        <h3 style="color: #0066cc; margin-bottom: 15px; font-size: 16px;">DISCRIMINAÇÃO DE VALORES</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${serviceValue > 0 ? `
            <tr>
              <td style="padding: 10px; background-color: #e3f2fd; border: 1px solid #0066cc; font-weight: bold; color: #0066cc; width: 70%;">
                Serviço (Mão de Obra)
              </td>
              <td style="padding: 10px; background-color: #e3f2fd; border: 1px solid #0066cc; text-align: right; font-weight: bold; color: #0066cc;">
                R$ ${serviceValue.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          ` : ''}
          
          ${productMatches.length > 0 ? productMatches.map((product: any) => `
            <tr>
              <td style="padding: 8px; background-color: #e8f5e8; border: 1px solid #28a745; color: #333;">
                ${product.name}
              </td>
              <td style="padding: 8px; background-color: #e8f5e8; border: 1px solid #28a745; text-align: right; font-weight: bold; color: #28a745;">
                R$ ${product.value.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          `).join('') : ''}
          
          ${productMatches.length > 0 ? `
            <tr>
              <td style="padding: 10px; background-color: #d4edda; border: 2px solid #28a745; font-weight: bold; color: #28a745;">
                Subtotal Produtos
              </td>
              <td style="padding: 10px; background-color: #d4edda; border: 2px solid #28a745; text-align: right; font-weight: bold; color: #28a745; font-size: 14px;">
                R$ ${productValue.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          ` : ''}
          
          <tr>
            <td style="padding: 15px; background-color: #f8f9fa; border: 3px solid #333; font-weight: bold; color: #333; font-size: 16px;">
              VALOR TOTAL DO SERVIÇO
            </td>
            <td style="padding: 15px; background-color: #f8f9fa; border: 3px solid #333; text-align: right; font-weight: bold; color: #333; font-size: 18px;">
              R$ ${totalAmount.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        </table>
        
        ${serviceValue > 0 && productMatches.length > 0 ? `
          <div style="margin-top: 10px; text-align: center; font-size: 12px; color: #666;">
            Composição: Serviço R$ ${serviceValue.toFixed(2).replace('.', ',')} + Produtos R$ ${productValue.toFixed(2).replace('.', ',')}
          </div>
        ` : ''}
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px;">
        <strong>Informações Importantes:</strong><br>
        - Serviço executado e testado<br>
        - Garantia de 30 dias para defeitos relacionados ao serviço<br>
        - Cliente responsável por backup de dados
      </div>
      
      <div class="signature-area">
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="text-align: center; width: 45%;">
            <div class="signature-line"></div>
            <p>Técnico Responsável</p>
          </div>
          <div style="text-align: center; width: 45%;">
            <div class="signature-line"></div>
            <p>Cliente</p>
          </div>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          Este documento foi gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  `;

  downloadPDF(htmlContent, `NotaServico_${transaction.client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Função para gerar relatório financeiro usando template do banco
export const generateFinancialReport = async (transactions: any[]) => {
  console.log("=== INICIANDO GERAÇÃO DE RELATÓRIO COM TEMPLATE ===");
  console.log("Transações recebidas:", transactions.length);
  
  try {
    // Buscar template do banco
    const templateResponse = await fetch('/api/templates');
    const templates = await templateResponse.json();
    const reportTemplate = templates.find((t: any) => t.type === 'relatorio' || t.name === 'Relatórios');
    
    if (!reportTemplate) {
      throw new Error("Template de relatório não encontrado");
    }
    
    console.log("Template encontrado:", reportTemplate.name);
    
    const entradas = transactions.filter(t => t.type === 'entrada');
    const saidas = transactions.filter(t => t.type === 'saida');
    const totalEntradas = entradas.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalSaidas = saidas.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const saldo = totalEntradas - totalSaidas;
    
    console.log("Entradas:", entradas.length, "Total:", totalEntradas);
    console.log("Saídas:", saidas.length, "Total:", totalSaidas);
    
    // Criar tabela de transações otimizada
    const tabelaTransacoes = `
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0;">
        <thead>
          <tr style="background-color: #0066cc; color: white;">
            <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px;">Data</th>
            <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px;">Cliente</th>
            <th style="padding: 10px 8px; text-align: left; font-weight: bold; font-size: 12px;">Descrição</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 12px;">Tipo</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: bold; font-size: 12px;">Valor</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 12px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map((transaction, index) => {
            const isEven = index % 2 === 0;
            const bgColor = isEven ? '#ffffff' : '#f9f9f9';
            const typeColor = transaction.type === 'entrada' ? '#28a745' : '#dc3545';
            
            return `
              <tr style="background-color: ${bgColor}; border-bottom: 1px solid #ddd;">
                <td style="padding: 8px; color: #333; font-size: 11px;">${new Date(transaction.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style="padding: 8px; color: #333; font-weight: 500; font-size: 11px;">${transaction.client?.name || 'N/A'}</td>
                <td style="padding: 8px; color: #666; font-size: 11px; max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${getCleanDescription(transaction.description || 'Sem descrição')}</td>
                <td style="padding: 8px; text-align: center; font-size: 11px; color: ${typeColor}; font-weight: bold;">
                  ${transaction.type === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                </td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: ${typeColor}; font-size: 12px;">
                  R$ ${parseFloat(transaction.amount).toFixed(2).replace('.', ',')}
                </td>
                <td style="padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #666;">
                  ${transaction.status || 'PENDENTE'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
        
        <!-- Linha de totais simplificada -->
        <tfoot>
          <tr style="background-color: #f8f9fa; border-top: 2px solid #0066cc;">
            <td colspan="4" style="padding: 12px 8px; font-weight: bold; color: #0066cc; font-size: 13px;">SALDO FINAL:</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #0066cc; font-size: 14px;">
              R$ ${(totalEntradas - totalSaidas).toFixed(2).replace('.', ',')}
            </td>
            <td style="padding: 12px 8px; text-align: center; font-weight: bold; color: #0066cc; font-size: 11px;">
              ${transactions.length} transações
            </td>
          </tr>
        </tfoot>
      </table>
    `;
    
    // Substituir variáveis no template
    let htmlContent = reportTemplate.content || '';
    
    // Variáveis básicas
    htmlContent = htmlContent.replace(/{{empresa_nome}}/g, reportTemplate.company_name || 'APOIOTEC INFORMÁTICA');
    htmlContent = htmlContent.replace(/{{empresa_cnpj}}/g, 'CNPJ: 00.000.000/0001-00');
    htmlContent = htmlContent.replace(/{{empresa_endereco}}/g, reportTemplate.company_address || 'Rua da Tecnologia, 123 - Centro - São Paulo/SP');
    htmlContent = htmlContent.replace(/{{empresa_telefone}}/g, reportTemplate.company_phone || '(11) 99999-9999');
    htmlContent = htmlContent.replace(/{{empresa_email}}/g, reportTemplate.company_email || 'contato@apoiotec.com.br');
    htmlContent = htmlContent.replace(/{{data_atual}}/g, new Date().toLocaleDateString('pt-BR'));
    htmlContent = htmlContent.replace(/{{data_geracao}}/g, new Date().toLocaleString('pt-BR'));
    
    // Variáveis financeiras
    htmlContent = htmlContent.replace(/{{total_entradas}}/g, `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`);
    htmlContent = htmlContent.replace(/{{total_saidas}}/g, `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`);
    htmlContent = htmlContent.replace(/{{saldo_final}}/g, `R$ ${Math.abs(saldo).toFixed(2).replace('.', ',')}`);
    htmlContent = htmlContent.replace(/{{status_saldo}}/g, saldo >= 0 ? 'Positivo' : 'Negativo');
    htmlContent = htmlContent.replace(/{{count_entradas}}/g, entradas.length.toString());
    htmlContent = htmlContent.replace(/{{count_saidas}}/g, saidas.length.toString());
    
    // Tabela de transações
    htmlContent = htmlContent.replace(/{{tabela_transacoes}}/g, tabelaTransacoes);
    
    console.log("Template processado com sucesso");
    
    // Gerar o PDF
    const finalHtmlContent = `
      <div class="document" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        ${htmlContent}
      </div>
    `;
    
    downloadPDF(finalHtmlContent, `RelatorioFinanceiro_${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error("Erro ao gerar relatório com template:", error);
    throw error;
  }
};