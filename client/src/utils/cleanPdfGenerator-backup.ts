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
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
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
    console.log("=== GERANDO PDF DE ORÇAMENTO ===", { 
      quote: {
        id: quote.id,
        title: quote.title,
        items: quote.items,
        total: quote.total
      }, 
      client 
    });
    
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    let itemsTable = '';
    let totalValue = 0;
    
    // Parse items from JSON string if needed
    let items = [];
    try {
      if (quote.items) {
        items = typeof quote.items === 'string' ? JSON.parse(quote.items) : quote.items;
        console.log("=== ITENS PARSEADOS ===", items);
      }
    } catch (error) {
      console.error("Error parsing quote items:", error);
      items = [];
    }
    
    if (items && Array.isArray(items) && items.length > 0) {
      itemsTable = `
        <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px;">
          <thead>
            <tr style="background: #2563eb; color: white;">
              <th style="padding: 6px 8px; border: 1px solid #2563eb; text-align: left; font-weight: bold;">Descrição</th>
              <th style="padding: 6px 4px; border: 1px solid #2563eb; text-align: center; font-weight: bold; width: 8%;">Qtd</th>
              <th style="padding: 6px 8px; border: 1px solid #2563eb; text-align: right; font-weight: bold; width: 20%;">Valor Unit.</th>
              <th style="padding: 6px 8px; border: 1px solid #2563eb; text-align: right; font-weight: bold; width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      items.forEach((item: any) => {
        // Corrigir cálculo - usar amount se não tiver price com validação robusta
        const itemPrice = parseFloat(String(item.amount || item.price || 0));
        const itemQuantity = parseInt(String(item.quantity || 1));
        const itemTotal = (isNaN(itemPrice) ? 0 : itemPrice) * (isNaN(itemQuantity) ? 1 : itemQuantity);
        totalValue += itemTotal;
        
        console.log("=== PROCESSANDO ITEM ===", { 
          item, 
          itemPrice, 
          itemQuantity, 
          itemTotal, 
          totalValue 
        });
        
        itemsTable += `
          <tr style="background-color: ${item.type === 'servico' ? '#eff6ff' : '#f0fdf4'}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 6px 8px; border: 1px solid #d1d5db; font-size: 10px;">
              <strong style="color: ${item.type === 'servico' ? '#2563eb' : '#16a34a'};">${item.type === 'servico' ? '🔧' : '📦'}</strong>
              ${item.description || item.name || 'Item'}
            </td>
            <td style="padding: 6px 4px; border: 1px solid #d1d5db; text-align: center; font-size: 10px;">${item.quantity || 1}</td>
            <td style="padding: 6px 8px; border: 1px solid #d1d5db; text-align: right; font-size: 10px;">R$ ${itemPrice.toFixed(2).replace('.', ',')}</td>
            <td style="padding: 6px 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-size: 10px; color: #059669;">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
          </tr>
        `;
      });
      
      itemsTable += `
          </tbody>
          <tfoot>
            <tr style="background: #333; color: white;">
              <td colspan="3" style="padding: 8px; border: 1px solid #333; text-align: right; font-weight: bold; font-size: 12px;">VALOR TOTAL</td>
              <td style="padding: 8px; border: 1px solid #333; text-align: right; font-weight: bold; font-size: 12px;">R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else {
      // Se não há itens estruturados, criar layout simples com valor total
      itemsTable = `
        <div style="text-align: center; padding: 20px; background-color: #f0f8ff; border: 1px solid #2563eb; border-radius: 3px;">
          <div style="font-size: 11px; color: #2563eb; margin-bottom: 4px;">Valor Total do Orçamento</div>
          <div style="font-size: 16px; font-weight: bold; color: #2563eb;">R$ ${parseFloat(quote.total || quote.amount || 0).toFixed(2).replace('.', ',')}</div>
        </div>
      `;
    }
    
    const htmlContent = `
      <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
        <!-- Header Compacto -->
        <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 60%;">
              <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">Apoiotec Informática</div>
              <div style="font-size: 9px; color: #666;">
                CNPJ: 12.345.678/0001-90<br>
                Rua da Tecnologia, 123 - Centro<br>
                Tel: (11) 99999-9999 | contato@apoiotec.com.br
              </div>
            </td>
            <td style="vertical-align: top; text-align: right; width: 40%;">
              <h1 style="color: #2563eb; margin: 0; font-size: 16px;">ORÇAMENTO Nº ${quote.id}</h1>
              <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
              <div style="font-size: 10px; color: #2563eb; font-weight: bold; margin-top: 2px;">${quote.title || 'Orçamento'}</div>
            </td>
          </tr>
        </table>
        
        <!-- Cliente e Descrição em tabela -->
        <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
              <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Cliente</div>
              <div style="font-size: 9px;">
                <strong>${client?.name || 'Cliente não informado'}</strong><br>
                Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
              </div>
            </td>
            <td style="width: 50%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
              <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Descrição</div>
              <div style="font-size: 9px;">${quote.description || 'Descrição não informada'}</div>
            </td>
          </tr>
        </table>
        
        <!-- Itens Compactos -->
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Itens Orçados</div>
          ${itemsTable}
        </div>
        
        <!-- Footer Compacto -->
        <table style="width: 100%; margin-top: 12px; border-top: 1px solid #ddd; padding-top: 6px;">
          <tr>
            <td style="width: 50%; font-size: 8px; color: #666; vertical-align: bottom;">
              <div>✓ Orçamento válido por 30 dias</div>
              <div>✓ Valores sujeitos a alteração</div>
            </td>
            <td style="width: 50%; text-align: right; vertical-align: bottom;">
              <div style="border: 1px solid #2563eb; padding: 4px 8px; font-size: 8px; display: inline-block;">
                <div style="color: #2563eb; font-weight: bold;">Assinatura do Cliente</div>
                <div style="margin-top: 8px; width: 80px; height: 1px; background: #2563eb;"></div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
    
    console.log("=== GERANDO PDF ===");
    downloadPDF(htmlContent, `Orcamento_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log("=== PDF GERADO COM SUCESSO ===");
    
  } catch (error) {
    console.error("Erro na geração do PDF do orçamento:", error);
    throw error;
  }
}