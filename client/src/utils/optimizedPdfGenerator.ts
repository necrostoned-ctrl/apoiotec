// Optimized PDF Generator - Lightweight version for smaller file sizes
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getFontSettings, mapFontFamily } from './fontSettings';

// Optimized download PDF function with smaller file sizes
async function downloadPDF(htmlContent: string, filename: string) {
  console.log("=== FUNÇÃO PDF OTIMIZADA CHAMADA ===");
  console.log("Filename:", filename);
  
  try {
    // Buscar configurações de fonte do sistema
    const fontConfig = await getFontSettings();
    const fontFamily = mapFontFamily(fontConfig.fontFamily);
    const fontSize = `${parseInt(fontConfig.pdfFontSize)}px`; // Usar pdfFontSize específico para PDFs
    
    console.log("Configurações de fonte do PDF otimizado:", { fontFamily, fontSize });
    
    // Create a temporary container to render the HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '900px'; // Largura maior para evitar cortes
    tempContainer.style.padding = '30px'; // Padding maior para melhor espaçamento
    tempContainer.style.fontFamily = fontFamily;
    tempContainer.style.fontSize = fontSize;
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.color = '#333';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.innerHTML = htmlContent;
    
    document.body.appendChild(tempContainer);
    
    console.log("Container temporário criado, gerando canvas otimizado...");
    
    // Generate canvas from HTML with balanced quality for ~1MB files
    const canvas = await html2canvas(tempContainer, {
      scale: 1.2, // Escala reduzida para evitar cortes
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 900, // Largura maior
      windowWidth: 900,
      removeContainer: true,
      imageTimeout: 0,
      logging: false
    });
    
    console.log("Canvas gerado, criando PDF compacto...");
    
    // Create PDF with compression
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true // Enable compression
    });
    
    // Convert canvas to balanced quality image data for ~1MB files
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality for better appearance
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm  
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
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
        console.log("PDF otimizado baixado diretamente no mobile!");
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
      // On desktop: direct download
      try {
        pdf.save(filename);
        console.log("PDF otimizado baixado diretamente no desktop!");
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
    console.error("Erro na função PDF otimizada:", error);
    throw error;
  }
}

// OPTIMIZED PDF GENERATORS

export async function generateQuotePDF(quote: any, client: any) {
  const settings = await getFontSettings();
  const baseFontSize = parseFloat(settings.pdfFontSize);
  const fs = (multiplier: number) => `${baseFontSize * multiplier}px`;
  
  try {
    console.log("=== INICIANDO GERAÇÃO DE PDF DO ORÇAMENTO OTIMIZADO ===");
    console.log("Quote data:", quote);
    console.log("Client data:", client);
    console.log("PDF Font Size:", settings.pdfFontSize, "Base:", baseFontSize);
    
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
      console.log("Erro ao parsear itens, usando dados básicos");
      items = [];
    }
    
    console.log("=== ITENS PARSEADOS ===", items);
    
    // Generate items table - matching service note format
    let itemsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: ${fs(1.5)};">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Tipo</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Descrição</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: right; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;
  
    let totalCalculated = 0;
    
    if (items.length > 0) {
      items.forEach((item: any) => {
        console.log("=== PROCESSANDO ITEM ===", item);
        
        const rawPrice = item.amount || item.price || '0';
        const itemTotal = parseFloat(rawPrice.toString()) || 0; // amount já é o valor total
        const itemQuantity = parseInt(item.quantity?.toString() || '1') || 1;
        totalCalculated += itemTotal;
        
        console.log("=== PROCESSANDO ITEM ===", { item, rawPrice, itemTotal, itemQuantity });
        
        const typeText = item.type === 'servico' ? 'SERVIÇO' : 'PRODUTO';
        const backgroundColor = item.type === 'servico' ? '#e6f3ff' : '#f0f9f0';
        const typeColor = item.type === 'servico' ? '#2563eb' : '#059669';
        
        // Format description with quantity if more than 1
        let itemDescription = item.description || item.name || 'Item';
        if (itemQuantity > 1 && itemTotal > 0) {
          const unitPrice = itemTotal / itemQuantity;
          itemDescription = `${itemQuantity}x ${itemDescription} (R$ ${unitPrice.toFixed(2).replace('.', ',')} cada)`;
        }
        
        itemsTable += `
          <tr style="background-color: ${backgroundColor};">
            <td style="padding: 5px 4px; border: 1px solid #ddd; color: ${typeColor}; font-weight: bold; font-size: ${fs(1.1)};">${typeText}</td>
            <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${itemDescription}</td>
            <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
          </tr>
        `;
      });
    } else {
      // If no items, show quote description and total  
      itemsTable += `
        <tr style="background-color: #e6f3ff;">
          <td style="padding: 5px 4px; border: 1px solid #ddd; color: #2563eb; font-weight: bold; font-size: ${fs(1.1)};">SERVIÇO</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${quote.description || quote.title || 'Serviço'}</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${parseFloat(quote.total || '0').toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
      totalCalculated = parseFloat(quote.total || '0');
    }
    
    itemsTable += '</tbody></table>';
  
    const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: ${fs(1.2)}; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: ${fs(2.1)}; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: ${fs(2.4)};">ORÇAMENTO</h1>
            <div style="font-size: ${fs(1.1)}; color: #666;">Nº ${quote.id || 'N/A'}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente Compacto -->
      <div style="background: #f8f9fa; padding: 6px; margin-bottom: 8px; border-left: 3px solid #2563eb;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)};">Cliente: ${client?.name || 'N/A'}</div>
        ${client?.phone ? `<div style="font-size: ${fs(1.2)}; color: #666;">Tel: ${client.phone}</div>` : ''}
      </div>
      
      <!-- Itens do Orçamento -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)}; margin-bottom: 3px;">Serviços e Produtos</div>
        ${itemsTable}
      </div>
      
      <!-- Valor Total Destacado -->
      <table style="width: 100%; margin: 8px 0;">
        <tr>
          <td style="width: 70%;"></td>
          <td style="width: 30%; background: #2563eb; color: white; padding: 6px; text-align: center;">
            <div style="font-size: ${fs(1.5)}; font-weight: bold;">VALOR TOTAL</div>
            <div style="font-size: ${fs(2.1)}; font-weight: bold;">R$ ${totalCalculated.toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Footer Compacto -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: ${fs(1.1)};">
        Orçamento válido por 30 dias - ${currentDate}
      </div>
    </div>
  `;
  
    console.log("=== INICIANDO DOWNLOAD DO PDF OTIMIZADO ===");
    
    const filename = `Orcamento_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    await downloadPDF(htmlContent, filename);
    console.log("=== PDF OTIMIZADO DOWNLOAD EXECUTADO ===");
    
  } catch (error) {
    console.error("Erro na geração do PDF do orçamento otimizado:", error);
    throw error;
  }
}

export async function generateReceiptPDF(transaction: any, client: any) {
  const settings = await getFontSettings();
  const baseFontSize = parseFloat(settings.pdfFontSize);
  const fs = (multiplier: number) => `${baseFontSize * multiplier}px`;
  
  console.log("🧾 === GERANDO RECIBO OTIMIZADO ===", { 
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
  
  const cleanDescription = getCleanDescription(transaction.description || '');
  
  // Extract service and product details from transaction
  let serviceDetails = [];
  let productDetails = [];
  let serviceTotal = 0;
  let productTotal = 0;
  
  try {
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
      serviceTotal = parseFloat(transaction.serviceAmount || '0');
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
      productTotal = parseFloat(transaction.productAmount || '0');
    }
  } catch (e) {
    console.log("Erro ao extrair detalhes no recibo:", e);
  }
  
  // Build items table
  let itemsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: ${fs(1.5)};">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Tipo</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Descrição</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: right; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add services
  serviceDetails.forEach(service => {
    itemsTable += `
      <tr style="background-color: #e6f3ff;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #2563eb; font-weight: bold; font-size: ${fs(1.1)};">SERVIÇO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${service.name || service.description}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${parseFloat(service.amount || service.price || '0').toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  });
  
  // Add products
  productDetails.forEach(product => {
    // Format description with quantity if more than 1
    let productDescription = product.name || product.description;
    const quantity = parseInt(product.quantity?.toString() || '1') || 1;
    const totalAmount = parseFloat(product.amount || product.price || '0');
    
    if (quantity > 1 && totalAmount > 0) {
      const unitPrice = totalAmount / quantity;
      productDescription = `${quantity}x ${productDescription} (R$ ${unitPrice.toFixed(2).replace('.', ',')} cada)`;
    }
    
    itemsTable += `
      <tr style="background-color: #f0f9f0;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #059669; font-weight: bold; font-size: ${fs(1.1)};">PRODUTO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${productDescription}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${totalAmount.toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  });
  
  // If no structured details, show clean description as payment
  if (serviceDetails.length === 0 && productDetails.length === 0) {
    itemsTable += `
      <tr style="background-color: #e6f3ff;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #2563eb; font-weight: bold; font-size: ${fs(1.1)};">SERVIÇO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${cleanDescription}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  }
  
  itemsTable += '</tbody></table>';
  
  const totalValue = parseFloat(transaction.amount.toString());
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: ${fs(1.2)}; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: ${fs(2.1)}; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: ${fs(2.4)};">RECIBO</h1>
            <div style="font-size: ${fs(1.1)}; color: #666;">Nº ${transaction.id || 'N/A'}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente Compacto -->
      <div style="background: #f8f9fa; padding: 6px; margin-bottom: 8px; border-left: 3px solid #2563eb;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)};">Cliente: ${client?.name || 'N/A'}</div>
        ${client?.phone ? `<div style="font-size: ${fs(1.2)}; color: #666;">Tel: ${client.phone}</div>` : ''}
      </div>
      
      <!-- Itens do Pagamento -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)}; margin-bottom: 3px;">Discriminação do Pagamento</div>
        ${itemsTable}
      </div>
      
      <!-- Valor Total Destacado -->
      <table style="width: 100%; margin: 8px 0;">
        <tr>
          <td style="width: 70%;"></td>
          <td style="width: 30%; background: #2563eb; color: white; padding: 6px; text-align: center;">
            <div style="font-size: ${fs(1.5)}; font-weight: bold;">VALOR TOTAL RECEBIDO</div>
            <div style="font-size: ${fs(2.1)}; font-weight: bold;">R$ ${totalValue.toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Footer Compacto -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: ${fs(1.1)};">
        Recibo emitido em ${currentDate}
      </div>
    </div>
  `;
  
  await downloadPDF(htmlContent, `Recibo_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateServiceNotePDF(transaction: any, client: any) {
  const settings = await getFontSettings();
  const baseFontSize = parseFloat(settings.pdfFontSize);
  const fs = (multiplier: number) => `${baseFontSize * multiplier}px`;
  
  console.log("📝 === GERANDO NOTA DE SERVIÇO OTIMIZADA ===", { 
    transaction: {
      id: transaction.id,
      description: transaction.description?.substring(0, 200),
      amount: transaction.amount
    }, 
    client 
  });
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Extract clean description
  const getCleanDescription = (description: string): string => {
    if (!description) return "Serviço prestado";
    
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
    
    return cleanLines.join(' ').trim() || "Serviço prestado";
  };
  
  const cleanDescription = getCleanDescription(transaction.description || '');
  
  // Extract service and product details from transaction
  let serviceDetails = [];
  let productDetails = [];
  let serviceTotal = 0;
  let productTotal = 0;
  
  try {
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
      serviceTotal = parseFloat(transaction.serviceAmount || '0');
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
      productTotal = parseFloat(transaction.productAmount || '0');
    }
  } catch (e) {
    console.log("Erro ao extrair detalhes:", e);
  }
  
  // Build items table
  let itemsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: ${fs(1.5)};">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Tipo</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Descrição</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: right; font-size: ${fs(1.5)}; font-weight: bold; vertical-align: middle;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add services
  serviceDetails.forEach(service => {
    itemsTable += `
      <tr style="background-color: #e6f3ff;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #2563eb; font-weight: bold; font-size: ${fs(1.1)};">SERVIÇO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${service.name || service.description}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${parseFloat(service.amount || service.price || '0').toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  });
  
  // Add products
  productDetails.forEach(product => {
    // Format description with quantity if more than 1
    let productDescription = product.name || product.description;
    const quantity = parseInt(product.quantity?.toString() || '1') || 1;
    const totalAmount = parseFloat(product.amount || product.price || '0');
    
    if (quantity > 1 && totalAmount > 0) {
      const unitPrice = totalAmount / quantity;
      productDescription = `${quantity}x ${productDescription} (R$ ${unitPrice.toFixed(2).replace('.', ',')} cada)`;
    }
    
    itemsTable += `
      <tr style="background-color: #f0f9f0;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #059669; font-weight: bold; font-size: ${fs(1.1)};">PRODUTO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${productDescription}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${totalAmount.toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  });
  
  // If no structured details, show clean description as service
  if (serviceDetails.length === 0 && productDetails.length === 0) {
    itemsTable += `
      <tr style="background-color: #e6f3ff;">
        <td style="padding: 5px 4px; border: 1px solid #ddd; color: #2563eb; font-weight: bold; font-size: ${fs(1.1)};">SERVIÇO</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)};">${cleanDescription}</td>
        <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)};">R$ ${parseFloat(transaction.amount.toString()).toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
  }
  
  itemsTable += '</tbody></table>';
  
  const totalValue = parseFloat(transaction.amount.toString());
  
  const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: ${fs(1.2)}; line-height: 1.2;">
      <!-- Header Compacto -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: ${fs(2.1)}; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: ${fs(2.4)};">NOTA DE SERVIÇO</h1>
            <div style="font-size: ${fs(1.1)}; color: #666;">Nº ${transaction.id || 'N/A'}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">Data: ${currentDate}</div>
          </td>
        </tr>
      </table>
      
      <!-- Cliente Compacto -->
      <div style="background: #f8f9fa; padding: 6px; margin-bottom: 8px; border-left: 3px solid #2563eb;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)};">Cliente: ${client?.name || 'N/A'}</div>
        ${client?.phone ? `<div style="font-size: ${fs(1.2)}; color: #666;">Tel: ${client.phone}</div>` : ''}
        <div style="font-size: ${fs(1.2)}; color: #666;">Data do Serviço: ${(() => {
          console.log('PDF Debug - transaction.createdAt:', transaction.createdAt);
          console.log('PDF Debug - transaction object:', transaction);
          const date = transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR') : 'N/A';
          console.log('PDF Debug - formatted date:', date);
          return date;
        })()}</div>
      </div>
      
      <!-- Itens do Serviço -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)}; margin-bottom: 3px;">Serviços e Produtos</div>
        ${itemsTable}
      </div>
      
      <!-- Valor Total Destacado -->
      <table style="width: 100%; margin: 8px 0;">
        <tr>
          <td style="width: 70%;"></td>
          <td style="width: 30%; background: #2563eb; color: white; padding: 6px; text-align: center;">
            <div style="font-size: ${fs(1.5)}; font-weight: bold;">VALOR TOTAL</div>
            <div style="font-size: ${fs(2.1)}; font-weight: bold;">R$ ${totalValue.toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Footer Compacto -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: ${fs(1.1)};">
        Nota de serviço emitida em ${currentDate}
      </div>
    </div>
  `;
  
  await downloadPDF(htmlContent, `NotaServico_${client?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateReportPDF(transactions: any[], filters: any) {
  const settings = await getFontSettings();
  const baseFontSize = parseFloat(settings.pdfFontSize);
  const fs = (multiplier: number) => `${baseFontSize * multiplier}px`;
  
  try {
    console.log("=== INICIANDO GERAÇÃO DE RELATÓRIO PDF OTIMIZADO ===", { 
      transactionsCount: transactions.length,
      filters
    });
    const currentDate = new Date().toLocaleDateString('pt-BR');
  
    let totalEntries = 0;
    let totalExits = 0;
    
    let transactionsTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 6px 0; font-size: ${fs(1.5)};">
      <thead>
        <tr style="background: #2563eb; color: white;">
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; line-height: 1.3; vertical-align: middle;">Data</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; line-height: 1.3; vertical-align: middle;">Cliente</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: left; font-size: ${fs(1.5)}; font-weight: bold; line-height: 1.3; vertical-align: middle;">Descrição</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: center; font-size: ${fs(1.5)}; font-weight: bold; line-height: 1.3; vertical-align: middle;">Tipo</th>
          <th style="padding: 8px 4px; border: 1px solid #2563eb; text-align: right; font-size: ${fs(1.5)}; font-weight: bold; line-height: 1.3; vertical-align: middle;">Valor</th>
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
    
      // Get clean description
      const getCleanDescription = (description: string): string => {
        if (!description) return "Transação financeira";
        
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
          <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)}; line-height: 1.3; white-space: nowrap;">${transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)}; line-height: 1.3;">${transaction.client?.name || 'N/A'}</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; font-size: ${fs(1.1)}; line-height: 1.3; word-wrap: break-word;">${cleanDescription}</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: center; color: ${typeColor}; font-weight: bold; font-size: ${fs(1.1)}; line-height: 1.3;">${typeText}</td>
          <td style="padding: 5px 4px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: ${fs(1.1)}; line-height: 1.3; white-space: nowrap;">R$ ${value.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  
    transactionsTable += '</tbody></table>';
  
    const balance = totalEntries - totalExits;
    
    const htmlContent = `
    <div style="margin: 0; padding: 8px; font-family: Arial, sans-serif; font-size: ${fs(1.2)}; line-height: 1.2;">
      <!-- Header Compacto igual ao Orçamento -->
      <table style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <div style="color: #2563eb; font-size: ${fs(2.1)}; font-weight: bold; margin-bottom: 2px;">${settings.companyName}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">
              CNPJ: ${settings.cnpj}<br>
              ${settings.address}<br>
              Tel: ${settings.phone} | ${settings.email}
            </div>
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%;">
            <h1 style="color: #2563eb; margin: 0; font-size: ${fs(2.4)};">RELATÓRIO FINANCEIRO</h1>
            <div style="font-size: ${fs(1.1)}; color: #666;">Data: ${currentDate}</div>
            <div style="font-size: ${fs(1.1)}; color: #666;">Transações: ${transactions.length}</div>
          </td>
        </tr>
      </table>
      
      <!-- Resumo Financeiro no estilo Orçamento -->
      <div style="background: #f8f9fa; padding: 6px; margin-bottom: 8px; border-left: 3px solid #2563eb;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)};">Resumo Financeiro</div>
        <div style="font-size: ${fs(1.2)}; color: #666; margin-top: 2px;">
          Entradas: R$ ${totalEntries.toFixed(2).replace('.', ',')} | 
          Saídas: R$ ${totalExits.toFixed(2).replace('.', ',')} | 
          Saldo: R$ ${balance.toFixed(2).replace('.', ',')}
        </div>
      </div>
      
      <!-- Transações no mesmo estilo da tabela de itens do orçamento -->
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; color: #2563eb; font-size: ${fs(1.5)}; margin-bottom: 3px;">Movimentações Financeiras</div>
        ${transactionsTable}
      </div>
      
      <!-- Total Destacado igual ao Orçamento -->
      <table style="width: 100%; margin: 8px 0;">
        <tr>
          <td style="width: 70%;"></td>
          <td style="width: 30%; background: #2563eb; color: white; padding: 6px; text-align: center;">
            <div style="font-size: ${fs(1.5)}; font-weight: bold;">SALDO FINAL</div>
            <div style="font-size: ${fs(2.1)}; font-weight: bold;">R$ ${balance.toFixed(2).replace('.', ',')}</div>
          </td>
        </tr>
      </table>
      
      <!-- Footer igual ao Orçamento -->
      <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: ${fs(1.1)};">
        Relatório financeiro gerado em ${currentDate}
      </div>
    </div>
  `;
  
    console.log("=== GERANDO PDF DO RELATÓRIO OTIMIZADO ===");
    await downloadPDF(htmlContent, `RelatorioFinanceiro_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log("=== PDF OTIMIZADO GERADO COM SUCESSO ===");
    
  } catch (error) {
    console.error("Erro na geração do PDF do relatório otimizado:", error);
    throw error;
  }
}