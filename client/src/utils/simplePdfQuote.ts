function downloadPDF(htmlContent: string, filename: string) {
  if (typeof window !== 'undefined') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print { 
              body { margin: 0; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 100);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

export function generateQuotePDF(quote: any, client: any) {
  try {
    console.log("=== GERANDO PDF SIMPLES ===", { quote, client });
    
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Parse items safely
    let items = [];
    let totalValue = 0;
    
    try {
      if (quote.items && typeof quote.items === 'string') {
        items = JSON.parse(quote.items);
      } else if (quote.items && Array.isArray(quote.items)) {
        items = quote.items;
      }
      console.log("Items parseados:", items);
    } catch (e) {
      console.error("Erro no parse:", e);
      items = [];
    }
    
    // Build items table
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = '<h3>Itens:</h3><table border="1" style="width:100%; border-collapse: collapse;">';
      itemsHtml += '<tr><th>Item</th><th>Tipo</th><th>Valor</th></tr>';
      
      items.forEach((item: any) => {
        const amount = parseFloat(item.amount || item.price || 0) || 0;
        totalValue += amount;
        
        itemsHtml += `
          <tr>
            <td>${item.description || item.name || 'Item'}</td>
            <td>${item.type === 'servico' ? 'Serviço' : 'Produto'}</td>
            <td>R$ ${amount.toFixed(2).replace('.', ',')}</td>
          </tr>
        `;
      });
      
      itemsHtml += `
        <tr style="font-weight: bold; background: #f0f0f0;">
          <td colspan="2">TOTAL</td>
          <td>R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
      itemsHtml += '</table>';
    } else {
      const quoteTotal = parseFloat(quote.total || 0) || 0;
      itemsHtml = `
        <div style="text-align: center; padding: 20px; border: 2px solid #0066cc; background: #f0f8ff;">
          <h3>Valor Total: R$ ${quoteTotal.toFixed(2).replace('.', ',')}</h3>
        </div>
      `;
    }
    
    const htmlContent = `
      <div style="max-width: 800px; margin: 0 auto;">
        <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
          <h1 style="color: #0066cc; margin: 0;">APOIOTEC INFORMÁTICA</h1>
          <p style="margin: 5px 0;">CNPJ: 12.345.678/0001-90</p>
          <p style="margin: 5px 0;">Rua da Tecnologia, 123 - Centro</p>
          <p style="margin: 5px 0;">Tel: (11) 99999-9999 | contato@apoiotec.com.br</p>
        </header>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #0066cc; text-align: center;">ORÇAMENTO Nº ${quote.id}</h2>
          <p><strong>Data:</strong> ${currentDate}</p>
          <p><strong>Título:</strong> ${quote.title || 'Orçamento'}</p>
          <p><strong>Cliente:</strong> ${client?.name || 'Cliente não informado'}</p>
          <p><strong>Telefone:</strong> ${client?.phone || 'N/A'}</p>
          <p><strong>Descrição:</strong> ${quote.description || 'Não informada'}</p>
        </div>
        
        ${itemsHtml}
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          <p>Orçamento válido por 30 dias</p>
          <p>Valores sujeitos a alteração sem aviso prévio</p>
        </div>
        
        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #000; margin-top: 40px;"></div>
            <p>Assinatura do Cliente</p>
          </div>
          <div style="text-align: center; width: 200px;">
            <div style="border-top: 1px solid #000; margin-top: 40px;"></div>
            <p>Apoiotec Informática</p>
          </div>
        </div>
      </div>
    `;
    
    const filename = `Orcamento_${quote.id}_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
    downloadPDF(htmlContent, filename);
    
    console.log("=== PDF GERADO ===");
    
  } catch (error) {
    console.error("ERRO GRAVE no PDF:", error);
    
    // Fallback extremamente simples
    const simpleHtml = `
      <h1>ORÇAMENTO #${quote.id}</h1>
      <p>Cliente: ${client?.name || 'N/A'}</p>
      <p>Total: R$ ${(quote.total || 0)}</p>
      <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
    `;
    
    downloadPDF(simpleHtml, `Orcamento_${quote.id}.pdf`);
  }
}