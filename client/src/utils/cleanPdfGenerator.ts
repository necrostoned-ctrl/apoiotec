// Clean PDF Generator - Simplified version without template complications
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getFontSettings, mapFontFamily } from './fontSettings';

// Function to generate PDF blob for viewer
async function generatePDFBlob(htmlContent: string): Promise<Blob> {
  console.log("=== GERANDO PDF BLOB ===");
  console.log("HTML length:", htmlContent.length);
  
  try {
    // Buscar configurações de fonte do sistema
    const fontConfig = await getFontSettings();
    const fontFamily = mapFontFamily(fontConfig.fontFamily);
    const fontSize = `${parseInt(fontConfig.pdfFontSize)}px`; // Usar pdfFontSize específico para PDFs
    
    console.log("Configurações de fonte do PDF:", { fontFamily, fontSize });
    
    // Create a temporary container to render the HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = fontFamily;
    tempContainer.style.fontSize = fontSize;
    tempContainer.style.lineHeight = '1.4';
    tempContainer.style.color = '#333';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.innerHTML = htmlContent;
    
    document.body.appendChild(tempContainer);
    
    console.log("Container temporário criado, gerando canvas...");
    
    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    });
    
    console.log("Canvas gerado, criando PDF...");
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm  
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // Return PDF as blob
    const pdfBlob = pdf.output('blob');
    console.log("PDF blob gerado com sucesso!");
    return pdfBlob;
    
  } catch (error: any) {
    console.error("Erro ao gerar PDF blob:", error);
    throw error;
  }
}

// Download PDF utility function
async function downloadPDF(htmlContent: string, filename: string) {
  console.log("=== FUNÇÃO DOWNLOADPDF CHAMADA ===");
  console.log("Filename:", filename);
  console.log("HTML length:", htmlContent.length);
  
  try {
    // Buscar configurações de fonte do sistema
    const fontConfig = await getFontSettings();
    const fontFamily = mapFontFamily(fontConfig.fontFamily);
    const fontSize = `${parseInt(fontConfig.pdfFontSize)}px`; // Usar pdfFontSize específico para PDFs
    
    console.log("Configurações de fonte do PDF:", { fontFamily, fontSize });
    
    // Create a temporary container to render the HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = fontFamily;
    tempContainer.style.fontSize = fontSize;
    tempContainer.style.lineHeight = '1.4';
    tempContainer.style.color = '#333';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.innerHTML = htmlContent;
    
    document.body.appendChild(tempContainer);
    
    console.log("Container temporário criado, gerando canvas...");
    
    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    });
    
    console.log("Canvas gerado, criando PDF...");
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm  
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile: try direct download first, then fallback to download link
      try {
        pdf.save(filename);
        console.log("PDF baixado diretamente no mobile!");
      } catch (mobileError) {
        console.log("Fallback mobile: criando link de download");
        // Create download link as fallback
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 10000);
      }
    } else {
      // On desktop: direct download instead of opening in browser
      try {
        pdf.save(filename);
        console.log("PDF baixado diretamente no desktop!");
      } catch (desktopError) {
        console.log("Fallback desktop: criando link de download");
        // Create download link as fallback
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 10000);
      }
    }
    
  } catch (error: any) {
    console.error("Erro na função downloadPDF:", error);
    
    // Fallback: open in new window for manual save
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${filename}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 15px; 
                  font-size: 12px; 
                  line-height: 1.4; 
                  color: #333;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  @page { 
                    margin: 1cm; 
                    size: A4;
                  }
                }
                .print-info { 
                  background: #e3f2fd; 
                  padding: 10px; 
                  border-radius: 4px; 
                  margin-bottom: 20px; 
                  text-align: center;
                }
                @media print { .print-info { display: none; } }
              </style>
            </head>
            <body>
              <div class="print-info">
                <h3 style="color: #2563eb; margin: 0 0 10px 0;">📄 Para salvar como PDF:</h3>
                <div style="margin: 0; font-size: 14px;">
                  <p><strong>💻 No computador:</strong></p>
                  <p style="margin: 5px 0;">1. Use <strong>Ctrl+P</strong> (ou Cmd+P no Mac)<br>
                  2. Selecione <strong>"Salvar como PDF"</strong><br>
                  3. Clique em <strong>"Salvar"</strong></p>
                  
                  <p><strong>📱 No celular:</strong></p>
                  <p style="margin: 5px 0;">1. Toque no <strong>menu ⋮</strong> do navegador<br>
                  2. Selecione <strong>"Imprimir"</strong><br>
                  3. Escolha <strong>"Salvar como PDF"</strong><br>
                  4. Toque em <strong>"Salvar"</strong></p>
                </div>
              </div>
              ${htmlContent}
              <script>
                window.focus();
                setTimeout(() => window.print(), 500);
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(fullHtml);
        printWindow.document.close();
      }
    } catch (fallbackError) {
      alert(`Erro ao gerar PDF: ${error?.message || "Erro desconhecido"}. Por favor, tente novamente.`);
    }
  }
}
export async function generateQuotePDF(quote: any, client: any) {
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
    
    // Buscar configurações do sistema
    const settings = await getFontSettings();
    
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
    } catch (error: any) {
      console.error("Error parsing quote items:", error);
      items = [];
    }
  
  if (items && Array.isArray(items) && items.length > 0) {
    itemsTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 20px;">
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
      // Corrigir cálculo - usar amount se não tiver price, com verificação segura
      const rawPrice = item.amount || item.price || 0;
      const itemPrice = parseFloat(rawPrice.toString()) || 0;
      const itemQuantity = parseInt((item.quantity || 1).toString()) || 1;
      const itemTotal = itemQuantity * itemPrice;
      totalValue += itemTotal;
      
      console.log("=== PROCESSANDO ITEM ===", {
        item,
        rawPrice,
        itemPrice,
        itemQuantity,
        itemTotal
      });
      
      itemsTable += `
        <tr style="background-color: ${item.type === 'servico' ? '#eff6ff' : '#f0fdf4'}; border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 6px 8px; border: 1px solid #d1d5db; font-size: 20px;">
            <strong style="color: ${item.type === 'servico' ? '#2563eb' : '#16a34a'};">${item.type === 'servico' ? '🔧' : '📦'}</strong>
            ${item.description || item.name || 'Item'}
          </td>
          <td style="padding: 6px 4px; border: 1px solid #d1d5db; text-align: center; font-size: 20px;">${itemQuantity}</td>
          <td style="padding: 6px 8px; border: 1px solid #d1d5db; text-align: right; font-size: 20px;">R$ ${itemPrice.toFixed(2).replace('.', ',')}</td>
          <td style="padding: 6px 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-size: 20px; color: #059669;">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
    
    itemsTable += `
        </tbody>
        <tfoot>
          <tr style="background: #2563eb; color: white;">
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; font-size: 22px;">VALOR TOTAL:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 24px;">R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
          </tr>
        </tfoot>
      </table>
    `;
  } else {
    // Show basic quote info if no items
    itemsTable = `
      <div style="background: #f8fafc; padding: 8px; border: 1px solid #e5e7eb; margin: 8px 0;">
        <div style="font-size: 20px; color: #666;">
          <strong>Descrição do Orçamento:</strong><br>
          ${quote.description || quote.title || 'Orçamento de serviços'}
        </div>
        <div style="margin-top: 8px; font-size: 24px; font-weight: bold; color: #2563eb;">
          Valor Total: R$ ${parseFloat(quote.total || quote.amount || 0).toFixed(2).replace('.', ',')}
        </div>
      </div>
    `;
    totalValue = parseFloat(quote.total || quote.amount || 0);
  }
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 22px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 18px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px;">ORÇAMENTO Nº ${quote.id}</h1>
            <div style="font-size: 18px; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Dados Cliente e Descrição em tabela -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
            <div style="font-weight: bold; color: #2563eb; font-size: 20px; margin-bottom: 2px;">Cliente</div>
            <div style="font-size: 18px;">
              <strong>${client?.name || 'Cliente não informado'}</strong><br>
              Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
            </div>
          </td>
          <td style="width: 50%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
            <div style="font-weight: bold; color: #2563eb; font-size: 20px; margin-bottom: 2px;">Descrição</div>
            <div style="font-size: 18px;">${quote.description || 'Descrição não informada'}</div>
          </td>
        </tr>
      </table>
      
      <!-- Itens Compactos -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 20px; margin-bottom: 3px;">Itens Orçados</div>
        ${itemsTable}
      </div>
      
      <!-- Footer Compacto -->
      <table style="width: 100%; margin-top: 12px; border-top: 1px solid #ddd; padding-top: 6px;">
        <tr>
          <td style="width: 50%; font-size: 16px; color: #666; vertical-align: bottom;">
            <div>✓ Orçamento válido por 30 dias</div>
            <div>✓ Valores sujeitos a alteração</div>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: bottom;">
            <div style="border: 1px solid #2563eb; padding: 4px 8px; font-size: 16px; display: inline-block;">
              <div style="color: #2563eb; font-weight: bold;">Assinatura do Cliente</div>
              <div style="margin-top: 8px; width: 80px; height: 1px; background: #2563eb;"></div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
  
    console.log("=== INICIANDO DOWNLOAD DO PDF ===");
    console.log("HTML Content length:", htmlContent.length);
    console.log("Client name for filename:", client?.name);
    
    const filename = `Orcamento_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log("Filename:", filename);
    
    await downloadPDF(htmlContent, filename);
    console.log("=== PDF DOWNLOAD EXECUTADO ===");
    
  } catch (error) {
    console.error("Erro na geração do PDF do orçamento:", error);
    throw error;
  }
}

export async function generateReceiptPDF(transaction: any, client: any) {
  const settings = await getFontSettings();
  
  console.log("🧾 === GERANDO RECIBO COM NOVO FORMATO ===", { 
    transaction: {
      id: transaction.id,
      description: transaction.description?.substring(0, 200),
      amount: transaction.amount
    }, 
    client 
  });
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Extract clean description without JSON data
  const getCleanDescription = (description: string): string => {
    if (!description) return "Pagamento recebido";
    
    const lines = description.split('\n');
    const cleanLines = lines.filter(line => 
      !line.includes('[{') &&
      !line.includes('}]') &&
      !line.includes('Discriminação de valores:') &&
      !line.includes('Serviços:') &&
      !line.includes('Produtos/Materiais:') &&
      !line.startsWith('- ') &&
      line.trim() !== ''
    );
    
    return cleanLines.join(' ').trim() || "Pagamento recebido";
  };
  
  // Extract products and services from description JSON (mesmo sistema da nota de serviço)
  let serviceDetails = [];
  let productDetails = [];
  let totalServiceValue = 0;
  let totalProductValue = 0;
  
  try {
    // Tentar extrair dos campos estruturados primeiro
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
    }
    
    // Se não há dados estruturados, extrair do JSON na descrição
    if (serviceDetails.length === 0 && productDetails.length === 0 && transaction.description) {
      const startIndex = transaction.description.indexOf('[{');
      const endIndex = transaction.description.lastIndexOf('}]');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonString = transaction.description.substring(startIndex, endIndex + 2);
        try {
          const allItems = JSON.parse(jsonString);
          console.log("=== ITENS ENCONTRADOS NO RECIBO ===", allItems);
          
          // Separar por tipo ou assumir que tudo sem tipo é produto
          serviceDetails = allItems.filter((item: any) => item.type === 'servico');
          productDetails = allItems.filter((item: any) => item.type === 'produto' || !item.type);
          
          console.log("=== SEPARAÇÃO NO RECIBO ===", { serviceDetails, productDetails });
        } catch (e) {
          console.log("Failed to parse JSON from description in receipt");
        }
      }
    }
    
    // Calcular totais
    totalServiceValue = serviceDetails.reduce((sum: number, item: any) => sum + parseFloat(item.amount || item.price || 0), 0);
    totalProductValue = productDetails.reduce((sum: number, item: any) => sum + parseFloat(item.amount || item.price || 0), 0);
    
    // Se temos produtos mas não serviços explícitos, calcular valor do serviço
    if (serviceDetails.length === 0 && productDetails.length > 0) {
      const totalTransactionValue = parseFloat(transaction.amount.toString()) || 0;
      const calculatedServiceValue = totalTransactionValue - totalProductValue;
      
      if (calculatedServiceValue > 0) {
        console.log("=== CALCULANDO VALOR DO SERVIÇO NO RECIBO ===", {
          totalTransaction: totalTransactionValue,
          totalProducts: totalProductValue,
          calculatedService: calculatedServiceValue
        });
        
        serviceDetails.push({
          description: "Mão de obra técnica",
          amount: calculatedServiceValue,
          type: 'servico'
        });
        totalServiceValue = calculatedServiceValue;
      }
    }
    
  } catch (error) {
    console.error("Erro ao fazer parse dos detalhes no recibo:", error);
  }
  
  // Build discriminated value table (mesmo formato da nota de serviço)
  let itemsTable = '';
  let hasItems = serviceDetails.length > 0 || productDetails.length > 0;
  
  if (hasItems) {
    itemsTable = `
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Discriminação de Valores</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
    `;
    
    // Services section
    if (serviceDetails.length > 0) {
      itemsTable += `
          <tr style="background: #e3f2fd;">
            <td colspan="2" style="padding: 4px 6px; border: 1px solid #2563eb; font-weight: bold; color: #2563eb;">
              🔧 SERVIÇOS (Mão de Obra)
            </td>
          </tr>
      `;
      serviceDetails.forEach((item: any) => {
        itemsTable += `
          <tr style="background-color: #f0f8ff;">
            <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
              ${item.description || item.name || 'Serviço'}
            </td>
            <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #2563eb;">
              R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      });
      
      if (totalServiceValue > 0) {
        itemsTable += `
          <tr style="background: #bbdefb; font-weight: bold;">
            <td style="padding: 4px 6px; border: 1px solid #2563eb; text-align: right;">
              Subtotal Serviços:
            </td>
            <td style="padding: 4px 6px; border: 1px solid #2563eb; text-align: right; color: #2563eb;">
              R$ ${totalServiceValue.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      }
    }
    
    // Products section
    if (productDetails.length > 0) {
      itemsTable += `
          <tr style="background: #e8f5e8;">
            <td colspan="2" style="padding: 4px 6px; border: 1px solid #16a34a; font-weight: bold; color: #16a34a;">
              📦 PRODUTOS/MATERIAIS
            </td>
          </tr>
      `;
      productDetails.forEach((item: any) => {
        itemsTable += `
          <tr style="background-color: #f0fdf4;">
            <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
              ${item.description || item.name || 'Produto'}
            </td>
            <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #16a34a;">
              R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      });
      
      if (totalProductValue > 0) {
        itemsTable += `
          <tr style="background: #c8e6c9; font-weight: bold;">
            <td style="padding: 4px 6px; border: 1px solid #16a34a; text-align: right;">
              Subtotal Produtos:
            </td>
            <td style="padding: 4px 6px; border: 1px solid #16a34a; text-align: right; color: #16a34a;">
              R$ ${totalProductValue.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      }
    }
    
    // Grand total
    const grandTotal = totalServiceValue + totalProductValue;
    itemsTable += `
          <tr style="background: #333; color: white; font-weight: bold; font-size: 10px;">
            <td style="padding: 6px; border: 1px solid #333; text-align: right;">
              VALOR TOTAL RECEBIDO:
            </td>
            <td style="padding: 6px; border: 1px solid #333; text-align: right;">
              R$ ${grandTotal.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        </table>
      </div>
    `;
  }
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2; background: white;">
      <!-- Header com tema azul igual à nota de serviço -->
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 8px; margin-bottom: 12px; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top;">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
              <div style="font-size: 9px; opacity: 0.9;">
                CNPJ: ${settings.cnpj}<br>
                ${settings.address}<br>
                Tel: ${settings.phone} | ${settings.email}
              </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <h1 style="margin: 0; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">RECIBO Nº ${transaction.id}</h1>
              <div style="font-size: 9px; opacity: 0.9;">Data: ${currentDate}</div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Seção do cliente com tema azul -->
      <div style="background: #f8fafc; border: 2px solid #e1e7ef; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
        <div style="color: #2563eb; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-bottom: 1px solid #e1e7ef; padding-bottom: 2px;">
          👤 DADOS DO CLIENTE
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 70%; vertical-align: top;">
              <div style="font-size: 9px;">
                <strong style="color: #1e40af;">${client?.name || 'Cliente não informado'}</strong><br>
                📞 ${client?.phone || 'N/A'} | ✉️ ${client?.email || 'N/A'}<br>
              </div>
            </td>
            <td style="width: 30%; text-align: center; background: #e1e7ef; border-radius: 4px; padding: 6px;">
              <div style="font-size: 8px; color: #2563eb; font-weight: bold;">VALOR RECEBIDO</div>
              <div style="font-size: 14px; font-weight: bold; color: #1e40af; margin-top: 2px;">
                R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}
              </div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Descrição do serviço com formatação limpa -->
      <div style="background: #f0f8ff; border: 2px solid #bfdbfe; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
        <div style="color: #2563eb; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-bottom: 1px solid #bfdbfe; padding-bottom: 2px;">
          📋 DESCRIÇÃO DO SERVIÇO
        </div>
        <div style="font-size: 9px; color: #374151; line-height: 1.4;">
          ${transaction.resolution || getCleanDescription(transaction.description) || 'Serviço executado'}
        </div>
      </div>
      
      ${hasItems ? `
      <!-- Discriminação de valores igual à nota de serviço -->
      <div style="background: #f8fafc; border: 2px solid #e1e7ef; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
        <div style="color: #2563eb; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-bottom: 1px solid #e1e7ef; padding-bottom: 2px;">
          💰 DISCRIMINAÇÃO DE VALORES
        </div>
        ${itemsTable}
      </div>
      ` : ''}
      
      <!-- Rodapé com assinatura -->
      <div style="margin-top: 12px; padding-top: 8px; border-top: 2px solid #e1e7ef;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle; font-size: 8px; color: #6b7280; font-style: italic;">
              📄 Este documento comprova o recebimento do pagamento pelos serviços prestados
            </td>
            <td style="text-align: right; vertical-align: middle; width: 200px;">
              <div style="border: 1px solid #d1d5db; background: #f9fafb; padding: 4px 8px; border-radius: 4px; text-align: center;">
                <div style="font-size: 8px; color: #6b7280; margin-bottom: 8px;">Assinatura do Responsável</div>
                <div style="height: 20px; border-bottom: 1px solid #9ca3af; margin-bottom: 2px;"></div>
                <div style="font-size: 7px; color: #9ca3af;">${settings.companyName}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
  
  await downloadPDF(htmlContent, `Recibo_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateServiceNotePDF(transaction: any, client: any) {
  const settings = await getFontSettings();
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Extract clean description without JSON data
  const getCleanDescription = (description: string): string => {
    if (!description) return "Serviço executado conforme solicitado";
    
    // Split by lines and filter out JSON, discrimination sections
    const lines = description.split('\n');
    const cleanLines = lines.filter(line => 
      !line.includes('[{') &&
      !line.includes('}]') &&
      !line.includes('Discriminação de valores:') &&
      !line.includes('Serviços:') &&
      !line.includes('Produtos/Materiais:') &&
      !line.startsWith('- ') &&
      line.trim() !== ''
    );
    
    return cleanLines.join(' ').trim() || "Serviço executado";
  };
  
  // Extract products and services from description JSON
  let serviceDetails = [];
  let productDetails = [];
  let totalServiceValue = 0;
  let totalProductValue = 0;
  
  try {
    // Try to extract from structured data first
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
    }
    
    // If no structured data, try to extract from description JSON
    if (serviceDetails.length === 0 && productDetails.length === 0 && transaction.description) {
      const startIndex = transaction.description.indexOf('[{');
      const endIndex = transaction.description.lastIndexOf('}]');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonString = transaction.description.substring(startIndex, endIndex + 2);
        try {
          const allItems = JSON.parse(jsonString);
          console.log("=== ITENS ENCONTRADOS NO JSON ===", allItems);
          
          // Separa por tipo ou assume que tudo sem tipo é produto
          serviceDetails = allItems.filter((item: any) => item.type === 'servico');
          productDetails = allItems.filter((item: any) => item.type === 'produto' || !item.type);
          
          console.log("=== APÓS SEPARAÇÃO ===", { serviceDetails, productDetails });
        } catch (e) {
          console.log("Failed to parse JSON from description");
        }
      }
    }
    
    // Calculate totals
    totalServiceValue = serviceDetails.reduce((sum: number, item: any) => sum + parseFloat(item.amount || item.price || 0), 0);
    totalProductValue = productDetails.reduce((sum: number, item: any) => sum + parseFloat(item.amount || item.price || 0), 0);
    
    // Se temos produtos mas não serviços explícitos, calcular valor do serviço
    if (serviceDetails.length === 0 && productDetails.length > 0) {
      const totalTransactionValue = parseFloat(transaction.amount.toString()) || 0;
      const calculatedServiceValue = totalTransactionValue - totalProductValue;
      
      if (calculatedServiceValue > 0) {
        console.log("=== CALCULANDO VALOR DO SERVIÇO ===", {
          totalTransaction: totalTransactionValue,
          totalProducts: totalProductValue,
          calculatedService: calculatedServiceValue
        });
        
        serviceDetails.push({
          description: "Mão de obra técnica",
          amount: calculatedServiceValue,
          type: 'servico'
        });
        totalServiceValue = calculatedServiceValue;
      }
    }
    
  } catch (error) {
    console.error("Erro ao fazer parse dos detalhes:", error);
  }
  
  // Build discriminated value table
  let itemsTable = '';
  let hasItems = serviceDetails.length > 0 || productDetails.length > 0;
  
  if (hasItems) {
    itemsTable = `
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Discriminação de Valores</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
    `;
    
    // Services section
    if (serviceDetails.length > 0) {
      itemsTable += `
          <tr style="background: #e3f2fd;">
            <td colspan="2" style="padding: 4px 6px; border: 1px solid #2563eb; font-weight: bold; color: #2563eb;">
              🔧 SERVIÇOS (Mão de Obra)
            </td>
          </tr>
      `;
      serviceDetails.forEach((item: any) => {
        itemsTable += `
          <tr style="background-color: #f0f8ff;">
            <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
              ${item.description || item.name || 'Serviço'}
            </td>
            <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #2563eb;">
              R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      });
      
      if (totalServiceValue > 0) {
        itemsTable += `
          <tr style="background: #bbdefb; font-weight: bold;">
            <td style="padding: 4px 6px; border: 1px solid #2563eb; text-align: right;">
              Subtotal Serviços:
            </td>
            <td style="padding: 4px 6px; border: 1px solid #2563eb; text-align: right; color: #2563eb;">
              R$ ${totalServiceValue.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      }
    }
    
    // Products section
    if (productDetails.length > 0) {
      itemsTable += `
          <tr style="background: #e8f5e8;">
            <td colspan="2" style="padding: 4px 6px; border: 1px solid #16a34a; font-weight: bold; color: #16a34a;">
              📦 PRODUTOS/MATERIAIS
            </td>
          </tr>
      `;
      productDetails.forEach((item: any) => {
        itemsTable += `
          <tr style="background-color: #f0fdf4;">
            <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
              ${item.description || item.name || 'Produto'}
            </td>
            <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #16a34a;">
              R$ ${parseFloat(item.amount || item.price || 0).toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      });
      
      if (totalProductValue > 0) {
        itemsTable += `
          <tr style="background: #c8e6c9; font-weight: bold;">
            <td style="padding: 4px 6px; border: 1px solid #16a34a; text-align: right;">
              Subtotal Produtos:
            </td>
            <td style="padding: 4px 6px; border: 1px solid #16a34a; text-align: right; color: #16a34a;">
              R$ ${totalProductValue.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        `;
      }
    }
    
    // Grand total
    const grandTotal = totalServiceValue + totalProductValue;
    itemsTable += `
          <tr style="background: #333; color: white; font-weight: bold; font-size: 10px;">
            <td style="padding: 6px; border: 1px solid #333; text-align: right;">
              VALOR TOTAL:
            </td>
            <td style="padding: 6px; border: 1px solid #333; text-align: right;">
              R$ ${grandTotal.toFixed(2).replace('.', ',')}
            </td>
          </tr>
        </table>
      </div>
    `;
  }
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 9px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 16px;">NOTA DE SERVIÇO Nº ${transaction.id}</h1>
            <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente e Valor em tabela -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="width: 70%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
            <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Cliente</div>
            <div style="font-size: 9px;">
              <strong>${client?.name || 'Cliente não informado'}</strong><br>
              Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
            </div>
          </td>
          <td style="width: 30%; background: #f0f8ff; border: 1px solid #2563eb; padding: 6px; text-align: center; vertical-align: middle;">
            <div style="font-size: 9px; color: #2563eb; font-weight: bold;">VALOR DO SERVIÇO</div>
            <div style="font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 2px;">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Descrição Compacta -->
      <div style="background: #f8fafc; padding: 6px; border-radius: 3px; border-left: 2px solid #2563eb; margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Serviço Executado</div>
        <div style="font-size: 9px;">${getCleanDescription(transaction.description || 'Serviço executado')}</div>
        ${transaction.resolution ? `<div style="font-size: 9px; margin-top: 3px; color: #16a34a;"><strong>Resolução:</strong> ${transaction.resolution}</div>` : ''}
      </div>
      
      ${hasItems ? `
      <!-- Discriminação dos valores -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Detalhamento de Serviços e Materiais</div>
        ${itemsTable}
      </div>
      ` : ''}
      
      <!-- Garantia -->
      <div style="background: #f0f8ff; padding: 6px; border: 1px solid #2563eb; margin-bottom: 12px; text-align: center;">
        <div style="font-size: 9px; color: #2563eb; font-weight: bold;">GARANTIA: 30 DIAS</div>
        <div style="font-size: 8px; color: #666; margin-top: 2px;">A partir da data de execução do serviço</div>
      </div>
      
      <!-- Footer Compacto -->
      <table style="width: 100%; margin-top: 12px; padding-top: 6px; border-top: 1px solid #ddd; border-collapse: collapse;">
        <tr>
          <td style="color: #666; font-size: 8px; font-style: italic; vertical-align: middle;">
            Esta nota comprova a execução do serviço
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <div style="border: 1px solid #ddd; padding: 3px 6px; font-size: 7px; display: inline-block;">
              <strong>Técnico Responsável</strong>
              <div style="margin-top: 6px; width: 80px; height: 1px; background: #ddd;"></div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
  
  await downloadPDF(htmlContent, `NotaServico_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateReportPDF(transactions: any[], filters: any) {
  const settings = await getFontSettings();
  
  try {
    console.log("=== INICIANDO GERAÇÃO DE RELATÓRIO PDF ===", { 
      transactionsCount: transactions.length,
      filters
    });
    const currentDate = new Date().toLocaleDateString('pt-BR');
  
    let totalEntries = 0;
    let totalExits = 0;
    
    let transactionsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 9px;">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Data</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Cliente</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Descrição</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: center; font-size: 9px;">Tipo</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: right; font-size: 9px;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;
  
    transactions.forEach(transaction => {
      const value = parseFloat(transaction.amount?.toString() || '0') || 0;
      if (transaction.type === 'entrada') {
        totalEntries += value;
      } else {
        totalExits += value;
      }
    
      // Get clean description using the same function as service notes
      const getCleanDescription = (description: string): string => {
        if (!description) return "Transação financeira";
        
        // Split by lines and filter out JSON, discrimination sections
        const lines = description.split('\n');
        const cleanLines = lines.filter(line => 
          !line.includes('[{') &&
          !line.includes('}]') &&
          !line.includes('Discriminação de valores:') &&
          !line.includes('Serviços:') &&
          !line.includes('Produtos/Materiais:') &&
          !line.startsWith('- ') &&
          line.trim() !== ''
        );
        
        return cleanLines.join(' ').trim() || "Transação financeira";
      };
      
      const cleanDescription = getCleanDescription(transaction.description || '') || transaction.resolution || 'Transação financeira';
      
      const typeColor = transaction.type === 'entrada' ? '#16a34a' : '#dc2626';
      const typeText = transaction.type === 'entrada' ? 'ENTRADA' : 'SAÍDA';
      
      transactionsTable += `
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</td>
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${transaction.client?.name || 'N/A'}</td>
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${cleanDescription}</td>
          <td style="padding: 3px; border: 1px solid #ddd; text-align: center; color: ${typeColor}; font-weight: bold; font-size: 8px;">${typeText}</td>
          <td style="padding: 3px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 8px;">R$ ${value.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  
    transactionsTable += '</tbody></table>';
  
    const balance = totalEntries - totalExits;
    
    const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 9px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 16px;">RELATÓRIO FINANCEIRO</h1>
            <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
            <div style="font-size: 9px; color: #666;">Transações: ${transactions.length}</div>
          </td>
        </tr>
      </table>
      
      <!-- Resumo Compacto em tabela -->
      <table style="width: 100%; margin-bottom: 8px; border-collapse: collapse; font-size: 9px;">
        <tr>
          <td style="width: 33%; text-align: center; padding: 4px; background: #f0fdf4; border-left: 2px solid #16a34a;">
            <div style="font-weight: bold; color: #333; font-size: 8px;">Entradas</div>
            <div style="font-size: 10px; font-weight: bold; color: #16a34a;">R$ ${totalEntries.toFixed(2).replace('.', ',')}</div>
          </td>
          <td style="width: 33%; text-align: center; padding: 4px; background: #fef2f2; border-left: 2px solid #dc2626;">
            <div style="font-weight: bold; color: #333; font-size: 8px;">Saídas</div>
            <div style="font-size: 10px; font-weight: bold; color: #dc2626;">R$ ${totalExits.toFixed(2).replace('.', ',')}</div>
          </td>
          <td style="width: 33%; text-align: center; padding: 4px; background: #f0f8ff; border-left: 2px solid #2563eb;">
            <div style="font-weight: bold; color: #333; font-size: 8px;">Saldo</div>
            <div style="font-size: 10px; font-weight: bold; color: #2563eb;">R$ ${balance.toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Transações -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Movimentações</div>
        ${transactionsTable}
      </div>
      
      <!-- Footer Compacto -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 7px;">
        Relatório gerado automaticamente em ${currentDate}
      </div>
    </div>
  `;
  
    console.log("=== GERANDO PDF DO RELATÓRIO ===");
    await downloadPDF(htmlContent, `RelatorioFinanceiro_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log("=== PDF GERADO COM SUCESSO ===");
    
  } catch (error) {
    console.error("Erro na geração do PDF do relatório:", error);
    throw error;
  }
}

// BLOB GENERATION FUNCTIONS FOR PDF VIEWER
export async function generateQuoteBlobPDF(quote: any, client: any): Promise<Blob> {
  const settings = await getFontSettings();
  
  try {
    console.log("=== GERANDO BLOB PDF DE ORÇAMENTO ===", { 
      quote: {
        id: quote.id,
        title: quote.title,
        items: quote.items,
        total: quote.total
      }, 
      client 
    });
    
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Try to parse items from quote
    let items = [];
    try {
      if (typeof quote.items === 'string') {
        items = JSON.parse(quote.items);
      } else if (Array.isArray(quote.items)) {
        items = quote.items;
      }
    } catch (e) {
      console.log("Could not parse quote items:", e);
    }
    
    let itemsTable = '';
    let totalService = 0;
    let totalProduct = 0;
    
    if (items.length > 0) {
      itemsTable = `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Itens do Orçamento</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
      `;
      
      // Group items by type
      const services = items.filter((item: any) => item.type === 'servico');
      const products = items.filter((item: any) => item.type === 'produto' || !item.type);
      
      // Services section
      if (services.length > 0) {
        itemsTable += `
            <tr style="background: #e3f2fd;">
              <td colspan="3" style="padding: 4px 6px; border: 1px solid #2563eb; font-weight: bold; color: #2563eb;">
                🔧 SERVIÇOS
              </td>
            </tr>
        `;
        services.forEach((item: any) => {
          const value = parseFloat(item.amount || item.price || 0);
          totalService += value;
          itemsTable += `
            <tr style="background-color: #f0f8ff;">
              <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
                ${item.description || item.name || 'Serviço'}
              </td>
              <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: center;">
                ${item.quantity || 1}
              </td>
              <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #2563eb;">
                R$ ${value.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          `;
        });
      }
      
      // Products section
      if (products.length > 0) {
        itemsTable += `
            <tr style="background: #e8f5e8;">
              <td colspan="3" style="padding: 4px 6px; border: 1px solid #16a34a; font-weight: bold; color: #16a34a;">
                📦 PRODUTOS/MATERIAIS
              </td>
            </tr>
        `;
        products.forEach((item: any) => {
          const value = parseFloat(item.amount || item.price || 0);
          totalProduct += value;
          itemsTable += `
            <tr style="background-color: #f0fdf4;">
              <td style="padding: 4px 6px; border: 1px solid #d1d5db;">
                ${item.description || item.name || 'Produto'}
              </td>
              <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: center;">
                ${item.quantity || 1}
              </td>
              <td style="padding: 4px 6px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #16a34a;">
                R$ ${value.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          `;
        });
      }
      
      // Total row
      const grandTotal = totalService + totalProduct;
      itemsTable += `
            <tr style="background: #333; color: white; font-weight: bold; font-size: 10px;">
              <td colspan="2" style="padding: 6px; border: 1px solid #333; text-align: right;">
                VALOR TOTAL:
              </td>
              <td style="padding: 6px; border: 1px solid #333; text-align: right;">
                R$ ${grandTotal.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          </table>
        </div>
      `;
    } else {
      // Fallback: show simple description and total
      itemsTable = `
        <div style="background: #f8fafc; padding: 8px; border-radius: 4px; border-left: 3px solid #2563eb; margin-bottom: 8px;">
          <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 4px;">Descrição do Serviço</div>
          <div style="font-size: 9px;">${quote.description || quote.title || 'Serviço conforme solicitado'}</div>
          <div style="text-align: right; margin-top: 6px; font-size: 12px; font-weight: bold; color: #2563eb;">
            Valor Total: R$ ${parseFloat(quote.total || quote.amount || 0).toFixed(2).replace('.', ',')}
          </div>
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
                CNPJ: 15.292.813.0001-70<br>
                Rua Maestro Vila Lobos, N° 381, Abolição 4, Mossoró-RN<br>
                Tel: 84988288543 - 84988363828 | albano@hotmail.dk, marcelo@live.no
              </div>
            </td>
            <td style="vertical-align: top; text-align: right; width: 40%;">
              <h1 style="color: #2563eb; margin: 0; font-size: 16px;">ORÇAMENTO Nº ${quote.id}</h1>
              <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
            </td>
          </tr>
        </table>
        
        <!-- Cliente -->
        <div style="background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; margin-bottom: 12px;">
          <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Cliente</div>
          <div style="font-size: 9px;">
            <strong>${client?.name || 'Cliente não informado'}</strong><br>
            Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
          </div>
        </div>
        
        ${itemsTable}
        
        <!-- Observações -->
        <div style="background: #f0f8ff; padding: 6px; border: 1px solid #2563eb; margin-bottom: 12px;">
          <div style="font-size: 9px; color: #2563eb; font-weight: bold; margin-bottom: 2px;">Observações</div>
          <div style="font-size: 8px; color: #666;">
            • Validade do orçamento: 15 dias<br>
            • Garantia: 30 dias para serviços<br>
            • Pagamento à vista ou parcelado (consulte condições)
          </div>
        </div>
        
        <!-- Footer com assinatura -->
        <div style="margin-top: 12px; padding-top: 8px; border-top: 2px solid #e1e7ef;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle; font-size: 8px; color: #6b7280; font-style: italic;">
                📄 Orçamento gerado automaticamente
              </td>
              <td style="text-align: right; vertical-align: middle; width: 200px;">
                <div style="border: 1px solid #d1d5db; background: #f9fafb; padding: 4px 8px; border-radius: 4px; text-align: center;">
                  <div style="font-size: 8px; color: #6b7280; margin-bottom: 8px;">Assinatura do Responsável</div>
                  <div style="height: 20px; border-bottom: 1px solid #9ca3af; margin-bottom: 2px;"></div>
                  <div style="font-size: 7px; color: #9ca3af;">${settings.companyName}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
    
    return await generatePDFBlob(htmlContent);
    
  } catch (error) {
    console.error("Erro ao gerar blob PDF do orçamento:", error);
    throw error;
  }
}

export async function generateReceiptBlobPDF(transaction: any, client: any): Promise<Blob> {
  const settings = await getFontSettings();
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 9px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 16px;">RECIBO Nº ${transaction.id}</h1>
            <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente e Valor em tabela -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="width: 70%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
            <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Cliente</div>
            <div style="font-size: 9px;">
              <strong>${client?.name || 'Cliente não informado'}</strong><br>
              Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
            </div>
          </td>
          <td style="width: 30%; background: #f0f8ff; border: 1px solid #2563eb; padding: 6px; text-align: center; vertical-align: middle;">
            <div style="font-size: 9px; color: #2563eb; font-weight: bold;">VALOR RECEBIDO</div>
            <div style="font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 2px;">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Descrição Compacta -->
      <div style="background: #f8fafc; padding: 6px; border-radius: 3px; border-left: 2px solid #2563eb; margin-bottom: 12px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Referente ao Pagamento de</div>
        <div style="font-size: 9px;">${transaction.description || 'Serviços prestados'}</div>
      </div>
      
      <!-- Footer com assinatura -->
      <div style="margin-top: 12px; padding-top: 8px; border-top: 2px solid #e1e7ef;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle; font-size: 8px; color: #6b7280; font-style: italic;">
              📄 Este documento comprova o recebimento do pagamento pelos serviços prestados
            </td>
            <td style="text-align: right; vertical-align: middle; width: 200px;">
              <div style="border: 1px solid #d1d5db; background: #f9fafb; padding: 4px 8px; border-radius: 4px; text-align: center;">
                <div style="font-size: 8px; color: #6b7280; margin-bottom: 8px;">Assinatura do Responsável</div>
                <div style="height: 20px; border-bottom: 1px solid #9ca3af; margin-bottom: 2px;"></div>
                <div style="font-size: 7px; color: #9ca3af;">${settings.companyName}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
  
  return await generatePDFBlob(htmlContent);
}

export async function generateServiceNoteBlobPDF(transaction: any, client: any): Promise<Blob> {
  const settings = await getFontSettings();
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Extract clean description without JSON data
  const getCleanDescription = (description: string): string => {
    if (!description) return "Serviço executado conforme solicitado";
    
    // Split by lines and filter out JSON, discrimination sections
    const lines = description.split('\n');
    const cleanLines = lines.filter(line => 
      !line.includes('[{') &&
      !line.includes('}]') &&
      !line.includes('Discriminação de valores:') &&
      !line.includes('Serviços:') &&
      !line.includes('Produtos/Materiais:') &&
      !line.startsWith('- ') &&
      line.trim() !== ''
    );
    
    return cleanLines.join(' ').trim() || "Serviço executado";
  };
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 9px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 16px;">NOTA DE SERVIÇO Nº ${transaction.id}</h1>
            <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente e Valor em tabela -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="width: 70%; background: #f8fafc; padding: 6px; border-left: 2px solid #2563eb; vertical-align: top;">
            <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Cliente</div>
            <div style="font-size: 9px;">
              <strong>${client?.name || 'Cliente não informado'}</strong><br>
              Tel: ${client?.phone || 'N/A'} | Email: ${client?.email || 'N/A'}
            </div>
          </td>
          <td style="width: 30%; background: #f0f8ff; border: 1px solid #2563eb; padding: 6px; text-align: center; vertical-align: middle;">
            <div style="font-size: 9px; color: #2563eb; font-weight: bold;">VALOR DO SERVIÇO</div>
            <div style="font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 2px;">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Descrição Compacta -->
      <div style="background: #f8fafc; padding: 6px; border-radius: 3px; border-left: 2px solid #2563eb; margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 2px;">Serviço Executado</div>
        <div style="font-size: 9px;">${getCleanDescription(transaction.description || 'Serviço executado')}</div>
        ${transaction.resolution ? `<div style="font-size: 9px; margin-top: 3px; color: #16a34a;"><strong>Resolução:</strong> ${transaction.resolution}</div>` : ''}
      </div>
      
      <!-- Garantia -->
      <div style="background: #f0f8ff; padding: 6px; border: 1px solid #2563eb; margin-bottom: 12px; text-align: center;">
        <div style="font-size: 9px; color: #2563eb; font-weight: bold;">GARANTIA: 30 DIAS</div>
        <div style="font-size: 8px; color: #666; margin-top: 2px;">A partir da data de execução do serviço</div>
      </div>
      
      <!-- Footer Compacto -->
      <table style="width: 100%; margin-top: 12px; padding-top: 6px; border-top: 1px solid #ddd; border-collapse: collapse;">
        <tr>
          <td style="color: #666; font-size: 8px; font-style: italic; vertical-align: middle;">
            Esta nota comprova a execução do serviço
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <div style="border: 1px solid #ddd; padding: 3px 6px; font-size: 7px; display: inline-block;">
              <strong>Técnico Responsável</strong>
              <div style="margin-top: 6px; width: 80px; height: 1px; background: #ddd;"></div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
  
  return await generatePDFBlob(htmlContent);
}

export async function generateReportBlobPDF(transactions: any[], filters: any): Promise<Blob> {
  const settings = await getFontSettings();
  
  try {
    console.log("=== INICIANDO GERAÇÃO DE BLOB RELATÓRIO PDF ===", { 
      transactionsCount: transactions.length,
      filters
    });
    const currentDate = new Date().toLocaleDateString('pt-BR');
  
    let totalEntries = 0;
    let totalExits = 0;
    
    let transactionsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 9px;">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Data</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Cliente</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: left; font-size: 9px;">Descrição</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: center; font-size: 9px;">Tipo</th>
          <th style="padding: 3px; border: 1px solid #2563eb; text-align: right; font-size: 9px;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;
  
    transactions.forEach(transaction => {
      const value = parseFloat(transaction.amount?.toString() || '0') || 0;
      if (transaction.type === 'entrada') {
        totalEntries += value;
      } else {
        totalExits += value;
      }
    
      // Get clean description using the same function as service notes
      const getCleanDescription = (description: string): string => {
        if (!description) return "Transação financeira";
        
        // Split by lines and filter out JSON, discrimination sections
        const lines = description.split('\n');
        const cleanLines = lines.filter(line => 
          !line.includes('[{') &&
          !line.includes('}]') &&
          !line.includes('Discriminação de valores:') &&
          !line.includes('Serviços:') &&
          !line.includes('Produtos/Materiais:') &&
          !line.startsWith('- ') &&
          line.trim() !== ''
        );
        
        return cleanLines.join(' ').trim() || "Transação financeira";
      };
      
      const cleanDescription = getCleanDescription(transaction.description || '') || transaction.resolution || 'Transação financeira';
      
      const typeColor = transaction.type === 'entrada' ? '#16a34a' : '#dc2626';
      const typeText = transaction.type === 'entrada' ? 'ENTRADA' : 'SAÍDA';
      
      transactionsTable += `
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</td>
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${transaction.client?.name || 'N/A'}</td>
          <td style="padding: 3px; border: 1px solid #ddd; font-size: 8px;">${cleanDescription}</td>
          <td style="padding: 3px; border: 1px solid #ddd; text-align: center; color: ${typeColor}; font-weight: bold; font-size: 8px;">${typeText}</td>
          <td style="padding: 3px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 8px;">R$ ${value.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  
    transactionsTable += '</tbody></table>';
    
    const balance = totalEntries - totalExits;
    
    const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: 14px; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: 9px; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: 16px;">RELATÓRIO FINANCEIRO</h1>
            <div style="font-size: 9px; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Resumo financeiro -->
      <div style="margin-bottom: 12px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <tr>
            <td style="width: 33.33%; background: #e8f5e8; padding: 6px; border: 1px solid #16a34a; text-align: center;">
              <div style="font-weight: bold; color: #16a34a; font-size: 9px;">ENTRADAS</div>
              <div style="font-size: 12px; font-weight: bold; color: #16a34a;">R$ ${totalEntries.toFixed(2).replace('.', ',')}</div>
            </td>
            <td style="width: 33.33%; background: #fef2f2; padding: 6px; border: 1px solid #dc2626; text-align: center;">
              <div style="font-weight: bold; color: #dc2626; font-size: 9px;">SAÍDAS</div>
              <div style="font-size: 12px; font-weight: bold; color: #dc2626;">R$ ${totalExits.toFixed(2).replace('.', ',')}</div>
            </td>
            <td style="width: 33.33%; background: #f0f8ff; padding: 6px; border: 1px solid #2563eb; text-align: center;">
              <div style="font-weight: bold; color: #2563eb; font-size: 9px;">SALDO</div>
              <div style="font-size: 12px; font-weight: bold; color: ${balance >= 0 ? '#16a34a' : '#dc2626'};">R$ ${balance.toFixed(2).replace('.', ',')}</div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Tabela de transações -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px;">Movimentações Financeiras (${transactions.length} registros)</div>
        ${transactionsTable}
      </div>
      
      <!-- Footer Compacto -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 7px;">
        Relatório gerado automaticamente em ${currentDate}
      </div>
    </div>
  `;
  
    console.log("=== GERANDO BLOB PDF DO RELATÓRIO ===");
    return await generatePDFBlob(htmlContent);
    
  } catch (error) {
    console.error("Erro na geração do blob PDF do relatório:", error);
    throw error;
  }
}