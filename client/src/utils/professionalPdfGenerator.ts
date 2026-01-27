import jsPDF from 'jspdf';
import { getFontSettings } from './fontSettings';

export interface PdfTemplate {
  fontName: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  pdfSubtitle?: string;
  pdfPhone1?: string;
  pdfPhone2?: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  footerText: string;
}

export async function getTemplateSettings(): Promise<PdfTemplate> {
  try {
    const settings = await getFontSettings();
    return {
      fontName: 'Helvetica',
      fontSize: parseInt(settings.pdfFontSize) || 11,
      primaryColor: settings.primaryColor || '#2563eb',
      secondaryColor: settings.secondaryColor || '#059669',
      companyName: settings.companyName || 'Apoiotec Informática',
      pdfSubtitle: settings.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática',
      pdfPhone1: settings.pdfPhone1 || '84988288543',
      pdfPhone2: settings.pdfPhone2 || '84988363828',
      cnpj: settings.cnpj || '00.000.000/0000-00',
      address: settings.address || 'Endereço não configurado',
      phone: settings.phone || 'Telefone não configurado',
      email: settings.email || 'email@apoiotec.com',
      footerText: settings.footerText || 'Documento emitido pelo sistema Apoiotec'
    };
  } catch (e) {
    return {
      fontName: 'Helvetica',
      fontSize: 11,
      primaryColor: '#2563eb',
      secondaryColor: '#059669',
      companyName: 'Apoiotec Informática',
      pdfSubtitle: 'Assessoria e Assistência Técnica em Informática',
      pdfPhone1: '84988288543',
      pdfPhone2: '84988363828',
      cnpj: '00.000.000/0000-00',
      address: 'Endereço não configurado',
      phone: 'Telefone não configurado',
      email: 'email@apoiotec.com',
      footerText: 'Documento emitido pelo sistema Apoiotec'
    };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  return [37, 99, 235];
}

interface FinancialReportFilters {
  clientName?: string;
  clientId?: string;
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
}

export async function generateInventoryReportPDF(products: any[], movements: any[], services: any[]): Promise<{ dataUrl: string; filename: string } | undefined> {
  const template = await getTemplateSettings();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const primaryRgb = hexToRgb('#22c55e') as [number, number, number]; // Verde para produtos

  const reportDate = new Date().toLocaleDateString('pt-BR');

  // ===== HEADER =====
  let yPos = 15;
  pdf.setFillColor(...primaryRgb);
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text(template.companyName, 15, 10);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática', 15, 14.5);

  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
  pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('RELATÓRIO DE ESTOQUE', pageWidth - 15, 10, { align: 'right' });

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(reportDate, pageWidth - 15, 16, { align: 'right' });

  yPos = 28;
  const rowHeight = 6;

  // ============ SEÇÃO 1: PRODUTOS EM ESTOQUE ============
  // Section Title
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('PRODUTOS EM ESTOQUE', 15, yPos);
  yPos += 6;

  // Table Header - Estoque Atual
  const tableTop = yPos;
  const colProd = 50;
  const colQtd = 25;
  const colValor = 35;

  pdf.setFillColor(...primaryRgb);
  pdf.rect(15, tableTop, pageWidth - 30, 8, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('Produto', 17, tableTop + 5.5);
  pdf.text('Qtd', 17 + colProd, tableTop + 5.5);
  pdf.text('Valor Unit.', 17 + colProd + colQtd, tableTop + 5.5);
  pdf.text('Total', 17 + colProd + colQtd + colValor, tableTop + 5.5);

  yPos = tableTop + 10;
  let rowCount = 0;

  // Mostrar todos os produtos com estoque atual
  for (const product of products) {
    const qty = parseInt(product.quantity) || 0;
    const price = parseFloat(product.price) || 0;
    const total = qty * price;

    // Alternating background
    if (rowCount % 2 === 0) {
      pdf.setFillColor(240, 245, 240);
      pdf.rect(15, yPos, pageWidth - 30, rowHeight, 'F');
    }

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');

    const prodName = product.name.substring(0, 25);
    pdf.text(prodName, 17, yPos + 4);
    pdf.text(qty.toString(), 17 + colProd + 5, yPos + 4);
    pdf.text(`R$ ${price.toFixed(2)}`, 17 + colProd + colQtd + 2, yPos + 4);
    pdf.text(`R$ ${total.toFixed(2)}`, 17 + colProd + colQtd + colValor + 2, yPos + 4);

    yPos += rowHeight;
    rowCount++;

    // Check page break
    if (yPos > pageHeight - 35) {
      pdf.addPage();
      yPos = 15;
    }
  }

  // ============ SEÇÃO 2: MOVIMENTAÇÕES DE ESTOQUE ============
  yPos += 8;
  
  // Section Title
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('MOVIMENTAÇÃO DE ESTOQUE', 15, yPos);
  yPos += 6;

  // Filter only SAÍDAS (saida - sem tilde)
  const outgoingMovements = movements.filter(m => m.type === 'saida');

  if (outgoingMovements.length === 0) {
    // Sem movimentações
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('Helvetica', 'italic');
    pdf.text('Nenhuma saída de produto registrada', 15, yPos);
  } else {
    // Table Header - Movimentações
    const tableTop2 = yPos;
    const colData = 25;
    const colProdutoMov = 70;
    const colClienteMov = 55;
    const colQtdMov = 15;

    pdf.setFillColor(...primaryRgb);
    pdf.rect(15, tableTop2, pageWidth - 30, 8, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Data', 17, tableTop2 + 5.5);
    pdf.text('Produto', 17 + colData, tableTop2 + 5.5);
    pdf.text('Cliente', 17 + colData + colProdutoMov, tableTop2 + 5.5);
    pdf.text('Qtd', 17 + colData + colProdutoMov + colClienteMov, tableTop2 + 5.5);

    yPos = tableTop2 + 10;
    rowCount = 0;

    // Mostrar movimentações de saída
    for (const mov of outgoingMovements) {
      const product = products.find(p => p.id === mov.productId);
      if (!product) continue;

      // Extrair info do notes - cliente
      let clientInfo = "N/A";
      if (mov.notes && mov.notes.trim()) {
        // Tentar extrair cliente em diferentes formatos
        let extracted = null;
        
        // Estratégia 1: Procurar por "cliente:" (case-insensitive)
        const clienteIndex = mov.notes.toLowerCase().indexOf("cliente:");
        if (clienteIndex !== -1) {
          // Pegar tudo após "cliente:" 
          extracted = mov.notes.substring(clienteIndex + 8).trim(); // +8 = "cliente:".length
        }
        
        // Estratégia 2: Se não achou, procurar por "serviço:"
        if (!extracted) {
          const servicoIndex = mov.notes.toLowerCase().indexOf("serviço:");
          if (servicoIndex !== -1) {
            extracted = mov.notes.substring(servicoIndex + 8).trim();
          }
        }
        
        // Estratégia 3: Se ainda não achou, pegar tudo após ": "
        if (!extracted) {
          const colonIndex = mov.notes.indexOf(": ");
          if (colonIndex !== -1) {
            extracted = mov.notes.substring(colonIndex + 2).trim();
          }
        }
        
        // Estratégia 4: Se ainda nada, usar o texto inteiro (fallback)
        if (!extracted) {
          extracted = mov.notes.trim();
        }
        
        // Limitar tamanho
        clientInfo = extracted.substring(0, 30);
      }

      // Alternating background
      if (rowCount % 2 === 0) {
        pdf.setFillColor(240, 245, 240);
        pdf.rect(15, yPos, pageWidth - 30, rowHeight, 'F');
      }

      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      const dateStr = new Date(mov.createdAt).toLocaleDateString('pt-BR');

      pdf.text(dateStr, 17, yPos + 4);
      pdf.text(product.name.substring(0, 28), 17 + colData, yPos + 4);
      pdf.text(clientInfo, 17 + colData + colProdutoMov, yPos + 4);
      pdf.text(mov.quantity.toString(), 17 + colData + colProdutoMov + colClienteMov + 3, yPos + 4);

      yPos += rowHeight;
      rowCount++;

      // Check page break
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = 15;
      }
    }
  }

  // ===== FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const filename = 'Relatorio_Estoque_' + new Date().toISOString().split('T')[0] + '.pdf';
  const dataUrl = pdf.output('dataurlstring');
  return { dataUrl, filename };
}

export async function generateFinancialReportPDF(transactions: any[], filters?: FinancialReportFilters): Promise<{ dataUrl: string; filename: string } | undefined> {
  const template = await getTemplateSettings();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const primaryRgb = hexToRgb(template.primaryColor) as [number, number, number];

  let yPos = 15;

  // ===== HEADER =====
  pdf.setFillColor(...primaryRgb);
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text(template.companyName, 15, 10);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática', 15, 14.5);

  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
  pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('RELATÓRIO FINANCEIRO', pageWidth - 15, 10, { align: 'right' });

  // Mostrar período no cabeçalho
  const periodText = filters?.periodLabel || 'Período: ' + new Date().toLocaleDateString('pt-BR');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(periodText, pageWidth - 15, 16, { align: 'right' });

  yPos = 26; // Espaçamento aumentado após o header

  // ===== TABLE HEADER =====
  const colWidths = {
    data: 22,
    cliente: 38,
    descricao: 101,
    valor: 25
  };

  const headerY = yPos;
  pdf.setFillColor(...primaryRgb);
  const totalWidth = colWidths.data + colWidths.cliente + colWidths.descricao + colWidths.valor;
  pdf.rect(15, yPos, totalWidth, 7, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');

  let xPos = 15;
  pdf.text('Data', xPos + 2, yPos + 5);
  xPos += colWidths.data;
  pdf.text('Cliente', xPos + 2, yPos + 5);
  xPos += colWidths.cliente;
  pdf.text('Descrição', xPos + 2, yPos + 5);
  xPos += colWidths.descricao;
  pdf.text('Valor', 15 + totalWidth - 2, yPos + 5, { align: 'right' });

  yPos += 8;

  // ===== TABLE DATA =====
  pdf.setFontSize(10.5);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'normal');

  let totalEntrada = 0;
  let totalSaida = 0;

  transactions.forEach((transaction: any) => {
    if (yPos > pageHeight - 20) {
      // New page
      pdf.addPage('portrait');
      yPos = 20;
      
      // Repeat header on new page
      pdf.setFillColor(...primaryRgb);
      pdf.rect(15, yPos, totalWidth, 7, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      
      xPos = 15;
      pdf.text('Data', xPos + 1, yPos + 5);
      xPos += colWidths.data;
      pdf.text('Cliente', xPos + 1, yPos + 5);
      xPos += colWidths.cliente;
      pdf.text('Descrição', xPos + 1, yPos + 5);
      xPos += colWidths.descricao;
      pdf.text('Valor', 15 + totalWidth - 3, yPos + 5, { align: 'right' });
      
      yPos += 8;
    }

    const amount = parseFloat(transaction.amount?.toString() || '0');
    if (transaction.type === 'entrada') {
      totalEntrada += amount;
    } else {
      totalSaida += amount;
    }

    // Calculate description lines with proper text wrapping
    const desc = (transaction.description || 'Sem descrição');
    const descLines = pdf.splitTextToSize(desc, 96);
    const numLines = Math.max(descLines.length, 1);
    const rowHeight = numLines * 4 + 2;

    pdf.setFillColor(250, 250, 250);
    pdf.rect(15, yPos, totalWidth, rowHeight, 'F');
    
    // Draw vertical and horizontal lines
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.1);
    
    // Vertical lines
    let lineX = 15;
    for (let i = 0; i <= 4; i++) {
      if (i === 0) lineX = 15;
      else if (i === 1) lineX = 15 + colWidths.data;
      else if (i === 2) lineX = 15 + colWidths.data + colWidths.cliente;
      else if (i === 3) lineX = 15 + colWidths.data + colWidths.cliente + colWidths.descricao;
      else lineX = 15 + totalWidth;
      
      pdf.line(lineX, yPos, lineX, yPos + rowHeight);
    }
    
    // Horizontal lines
    pdf.line(15, yPos, 15 + totalWidth, yPos);
    pdf.line(15, yPos + rowHeight, 15 + totalWidth, yPos + rowHeight);

    pdf.setFontSize(10.5);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');

    xPos = 15;
    const dateStr = new Date(transaction.createdAt).toLocaleDateString('pt-BR');
    pdf.text(dateStr, xPos + 2, yPos + 3);
    xPos += colWidths.data;

    const clientName = transaction.client?.name || 'N/A';
    pdf.text(clientName.substring(0, 28), xPos + 2, yPos + 3);
    xPos += colWidths.cliente;

    let lineYPos = yPos + 3;
    descLines.forEach((line: string) => {
      pdf.text(line, xPos + 2, lineYPos);
      lineYPos += 4;
    });
    xPos += colWidths.descricao;

    const valorStr = 'R$ ' + amount.toFixed(2).replace('.', ',');
    pdf.setTextColor(transaction.type === 'entrada' ? 0 : 100, transaction.type === 'entrada' ? 100 : 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text(valorStr, 15 + totalWidth - 3, yPos + (rowHeight / 2), { align: 'right' });

    yPos += rowHeight;
  });

  // ===== FOOTER SUMMARY =====
  yPos += 5;
  pdf.setFillColor(245, 245, 245);
  pdf.rect(15, yPos, totalWidth, 24, 'F');
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(15, yPos, totalWidth, 24);

  pdf.setFontSize(10);
  pdf.setTextColor(...primaryRgb);
  pdf.setFont('Helvetica', 'bold');

  xPos = 15;
  pdf.text('RESUMO:', xPos + 5, yPos + 4);

  xPos = 15 + totalWidth - 70;
  pdf.setTextColor(0, 150, 0);
  pdf.text('Total Entradas: R$ ' + totalEntrada.toFixed(2).replace('.', ','), xPos, yPos + 4);
  
  pdf.setTextColor(200, 0, 0);
  pdf.text('Total Saídas: R$ ' + totalSaida.toFixed(2).replace('.', ','), xPos, yPos + 10);

  // Calculate and display final balance
  const saldo = totalEntrada - totalSaida;
  const saldoColor: [number, number, number] = saldo >= 0 ? [0, 100, 0] : [200, 0, 0]; // Green if positive, red if negative
  pdf.setTextColor(...saldoColor);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('SALDO FINAL: R$ ' + saldo.toFixed(2).replace('.', ','), xPos, yPos + 16);

  // ===== PAGE FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });

  const filename = 'RelatorioFinanceiro_' + new Date().toISOString().split('T')[0] + '.pdf';
  const dataUrl = pdf.output('dataurlstring');
  return { dataUrl, filename };
}

export async function generateQuotePDF(quote: any, client: any): Promise<{ dataUrl: string; filename: string } | undefined> {
  const template = await getTemplateSettings();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const primaryRgb = hexToRgb(template.primaryColor) as [number, number, number];

  let items = [];
  try {
    if (typeof quote.items === 'string') {
      items = JSON.parse(quote.items);
    } else if (Array.isArray(quote.items)) {
      items = quote.items;
    }
  } catch (e) {
    console.log("Erro ao parsear itens");
  }

  let yPos = 15;

  // ===== HEADER =====
  pdf.setFillColor(...primaryRgb);
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text(template.companyName, 15, 10);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática', 15, 14.5);

  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
  pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('ORCAMENTO', pageWidth - 15, 10, { align: 'right' });

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const quoteDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(quoteDate, pageWidth - 15, 16, { align: 'right' });

  yPos = 24;

  // ===== CLIENTE SECTION =====
  const docType = (client as any)?.documentType === 'cnpj' ? 'CNPJ' : 'CPF';
  const line1Parts = [client?.name || 'N/A'];
  if (client?.cpf) line1Parts.push(`${docType}: ${client.cpf}`);
  if (client?.phone) line1Parts.push(`Tel: ${client.phone}`);
  
  const line2Parts = [];
  if (client?.email) line2Parts.push(`Email: ${client.email}`);
  if (client?.address) line2Parts.push(`End: ${client.address}`);
  
  const line1 = line1Parts.join('  |  ');
  const line2 = line2Parts.join('  |  ');
  
  pdf.setDrawColor(...primaryRgb);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(240, 247, 255);
  pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
  pdf.rect(15, yPos, pageWidth - 30, 12);

  pdf.setFontSize(10);
  pdf.setTextColor(...primaryRgb);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('CLIENTE', 18, yPos + 4);

  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(line1, 18, yPos + 8);
  if (line2) pdf.text(line2, 18, yPos + 11);

  yPos += 14;

  // ===== ITEMS =====
  const serviceItems = items.filter((i: any) => i.type === 'servico');
  const productItems = items.filter((i: any) => i.type === 'produto');

  // SERVICOS
  if (serviceItems.length > 0) {
    pdf.setFillColor(...primaryRgb);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('SERVICOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let serviceTotal = 0;
    serviceItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      serviceTotal += subtotal;

      const desc = item.description || item.name || 'Servico';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Servicos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + serviceTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 6;
  }

  // PRODUTOS
  if (productItems.length > 0) {
    pdf.setFillColor(5, 150, 105);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('PRODUTOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let productTotal = 0;
    productItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      productTotal += subtotal;

      const desc = item.description || item.name || 'Produto';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Produtos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + productTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 7;
  }

  // ===== DESCONTO SECTION =====
  const quoteDiscountAmount = parseFloat(quote.discountAmount?.toString() || '0');
  const quoteOriginalAmount = parseFloat(quote.originalAmount?.toString() || '0');
  const quoteFinalAmount = items.reduce((sum: number, item: any) => {
    const quantity = parseInt(item.quantity?.toString() || '1') || 1;
    const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
    const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
    const itemTotal = unitPrice > 0 ? unitPrice * quantity : amount;
    return sum + itemTotal;
  }, 0) || parseFloat(quote.total || '0');

  if (quoteDiscountAmount > 0) {
    pdf.setFillColor(255, 243, 224); // Light orange background
    pdf.rect(15, yPos, 180, 12, 'F');
    pdf.setDrawColor(255, 152, 0); // Orange border
    pdf.setLineWidth(0.5);
    pdf.rect(15, yPos, 180, 12);

    pdf.setFontSize(9);
    pdf.setTextColor(255, 87, 34); // Dark orange text
    pdf.setFont('Helvetica', 'bold');
    pdf.text('DESCONTO APLICADO', 18, yPos + 4);

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('-R$ ' + quoteDiscountAmount.toFixed(2).replace('.', ','), 193, yPos + 4, { align: 'right' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Valor Original:', 135, yPos + 8, { align: 'right' });
    pdf.text('R$ ' + quoteOriginalAmount.toFixed(2).replace('.', ','), 193, yPos + 8, { align: 'right' });

    yPos += 14;
  }

  // ===== TOTAL =====
  const totalAmount = quoteFinalAmount;

  pdf.setFillColor(...primaryRgb);
  pdf.rect(155, yPos, 40, 10, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  const totalText = 'TOTAL R$ ' + totalAmount.toFixed(2).replace('.', ',');
  pdf.text(totalText, 175, yPos + 6.5, { align: 'center' });

  // ===== FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const filename = 'Orcamento_' + (client?.name?.replace(/\s+/g, '_') || 'Cliente') + '_' + new Date().toISOString().split('T')[0] + '.pdf';
  
  const dataUrl = pdf.output('dataurlstring');
  return { dataUrl, filename };
}

export async function generateReceiptPDF(transaction: any, client: any): Promise<{ dataUrl: string; filename: string } | undefined> {
  const template = await getTemplateSettings();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const primaryRgb = hexToRgb(template.primaryColor) as [number, number, number];

  let serviceDetails = [];
  let productDetails = [];

  try {
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
    }
  } catch (e) {
    console.log("Erro ao extrair detalhes");
  }

  let yPos = 15;

  // ===== HEADER =====
  pdf.setFillColor(...primaryRgb);
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text(template.companyName, 15, 10);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática', 15, 14.5);

  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
  pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('RECIBO', pageWidth - 15, 10, { align: 'right' });

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const receiptDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(receiptDate, pageWidth - 15, 16, { align: 'right' });

  yPos = 24;

  // ===== CLIENTE SECTION =====
  const docType = (client as any)?.documentType === 'cnpj' ? 'CNPJ' : 'CPF';
  const line1Parts = [client?.name || 'N/A'];
  if (client?.cpf) line1Parts.push(`${docType}: ${client.cpf}`);
  if (client?.phone) line1Parts.push(`Tel: ${client.phone}`);
  
  const line2Parts = [];
  if (client?.email) line2Parts.push(`Email: ${client.email}`);
  if (client?.address) line2Parts.push(`End: ${client.address}`);
  
  const line1 = line1Parts.join('  |  ');
  const line2 = line2Parts.join('  |  ');
  
  pdf.setDrawColor(...primaryRgb);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(240, 247, 255);
  pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
  pdf.rect(15, yPos, pageWidth - 30, 12);

  pdf.setFontSize(10);
  pdf.setTextColor(...primaryRgb);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('CLIENTE', 18, yPos + 4);

  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(line1, 18, yPos + 8);
  if (line2) pdf.text(line2, 18, yPos + 11);

  yPos += 14;

  // ===== ITEMS =====
  const serviceItems = serviceDetails.map((s: any) => ({ ...s, type: 'servico' }));
  const productItems = productDetails.map((p: any) => ({ ...p, type: 'produto' }));

  // SERVICOS
  if (serviceItems.length > 0) {
    pdf.setFillColor(...primaryRgb);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('SERVICOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let serviceTotal = 0;
    serviceItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      serviceTotal += subtotal;

      const desc = item.description || item.name || 'Servico';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Servicos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + serviceTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 6;
  }

  // PRODUTOS
  if (productItems.length > 0) {
    pdf.setFillColor(5, 150, 105);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('PRODUTOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let productTotal = 0;
    productItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      productTotal += subtotal;

      const desc = item.description || item.name || 'Produto';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Produtos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + productTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 7;
  }

  // ===== DESCONTO SECTION =====
  const discountAmount = parseFloat(transaction.discountAmount?.toString() || '0');
  const originalAmount = parseFloat(transaction.originalAmount?.toString() || transaction.amount?.toString() || '0');
  const finalAmount = parseFloat(transaction.amount?.toString() || '0');

  if (discountAmount > 0) {
    pdf.setFillColor(255, 243, 224); // Light orange background
    pdf.rect(15, yPos, 180, 12, 'F');
    pdf.setDrawColor(255, 152, 0); // Orange border
    pdf.setLineWidth(0.5);
    pdf.rect(15, yPos, 180, 12);

    pdf.setFontSize(9);
    pdf.setTextColor(255, 87, 34); // Dark orange text
    pdf.setFont('Helvetica', 'bold');
    pdf.text('DESCONTO APLICADO', 18, yPos + 4);

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('-R$ ' + discountAmount.toFixed(2).replace('.', ','), 193, yPos + 4, { align: 'right' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Valor Original:', 135, yPos + 8, { align: 'right' });
    pdf.text('R$ ' + originalAmount.toFixed(2).replace('.', ','), 193, yPos + 8, { align: 'right' });

    yPos += 14;
  }

  // ===== TOTAL =====
  const totalAmount = finalAmount;

  pdf.setFillColor(...primaryRgb);
  pdf.rect(155, yPos, 40, 10, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  const totalText = 'TOTAL R$ ' + totalAmount.toFixed(2).replace('.', ',');
  pdf.text(totalText, 175, yPos + 6.5, { align: 'center' });

  // ===== FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const filename = 'NotaServico_' + (client?.name?.replace(/\s+/g, '_') || 'Cliente') + '_' + new Date().toISOString().split('T')[0] + '.pdf';
  
  const dataUrl = pdf.output('dataurlstring');
  return { dataUrl, filename };
}
export async function generateServiceNotePDF(transaction: any, client: any): Promise<{ dataUrl: string; filename: string } | undefined> {
  const template = await getTemplateSettings();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const primaryRgb = hexToRgb(template.primaryColor) as [number, number, number];

  let serviceDetails = [];
  let productDetails = [];

  try {
    if (transaction.serviceDetails) {
      serviceDetails = JSON.parse(transaction.serviceDetails);
    }
    if (transaction.productDetails) {
      productDetails = JSON.parse(transaction.productDetails);
    }
  } catch (e) {
    console.log("Erro ao extrair detalhes");
  }

  let yPos = 15;

  // ===== HEADER =====
  pdf.setFillColor(...primaryRgb);
  pdf.rect(0, 0, pageWidth, 22, 'F');

  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text(template.companyName, 15, 10);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.pdfSubtitle || 'Assessoria e Assistência Técnica em Informática', 15, 14.5);

  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
  pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('NOTA DE SERVIÇO', pageWidth - 15, 10, { align: 'right' });

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'normal');
  const serviceNoteDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(serviceNoteDate, pageWidth - 15, 16, { align: 'right' });

  yPos = 24;

  // ===== CLIENTE SECTION =====
  const docType = (client as any)?.documentType === 'cnpj' ? 'CNPJ' : 'CPF';
  const line1Parts = [client?.name || 'N/A'];
  if (client?.cpf) line1Parts.push(`${docType}: ${client.cpf}`);
  if (client?.phone) line1Parts.push(`Tel: ${client.phone}`);
  
  const line2Parts = [];
  if (client?.email) line2Parts.push(`Email: ${client.email}`);
  if (client?.address) line2Parts.push(`End: ${client.address}`);
  
  const line1 = line1Parts.join('  |  ');
  const line2 = line2Parts.join('  |  ');
  
  pdf.setDrawColor(...primaryRgb);
  pdf.setLineWidth(0.3);
  pdf.setFillColor(240, 247, 255);
  pdf.rect(15, yPos, pageWidth - 30, 12, 'F');
  pdf.rect(15, yPos, pageWidth - 30, 12);

  pdf.setFontSize(10);
  pdf.setTextColor(...primaryRgb);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('CLIENTE', 18, yPos + 4);

  pdf.setFontSize(7.5);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(line1, 18, yPos + 8);
  if (line2) pdf.text(line2, 18, yPos + 11);

  yPos += 14;

  // ===== ITEMS =====
  const serviceItems = serviceDetails.map((s: any) => ({ ...s, type: 'servico' }));
  const productItems = productDetails.map((p: any) => ({ ...p, type: 'produto' }));

  // SERVICOS
  if (serviceItems.length > 0) {
    pdf.setFillColor(...primaryRgb);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('SERVICOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let serviceTotal = 0;
    serviceItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      serviceTotal += subtotal;

      const desc = item.description || item.name || 'Servico';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Servicos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + serviceTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 6;
  }

  // PRODUTOS
  if (productItems.length > 0) {
    pdf.setFillColor(5, 150, 105);
    pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('PRODUTOS', 18, yPos + 4);
    yPos += 7;

    // Table header - same width as SERVICOS bar
    const headerYPos = yPos; // Save header position for vertical lines
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, yPos, 10, 5, 'F');
    pdf.rect(25, yPos, 10, 5, 'F');
    pdf.rect(35, yPos, 120, 5, 'F');
    pdf.rect(155, yPos, 20, 5, 'F');
    pdf.rect(175, yPos, 20, 5, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Item', 17, yPos + 3.5);
    pdf.text('Qtd', 28, yPos + 3.5);
    pdf.text('Descricao', 60, yPos + 3.5);
    pdf.text("V.Unit", 165, yPos + 3.5, { align: 'center' });
    pdf.text('Valor', 185, yPos + 3.5, { align: 'center' });

    yPos += 6;

    let productTotal = 0;
    productItems.forEach((item: any, idx: number) => {
      const quantity = parseInt(item.quantity?.toString() || '1') || 1;
      const unitPrice = parseFloat(item.unitPrice?.toString() || '0') || 0;
      const amount = parseFloat(item.amount?.toString() || item.price?.toString() || '0') || 0;
      const subtotal = unitPrice > 0 ? unitPrice * quantity : amount;
      productTotal += subtotal;

      const desc = item.description || item.name || 'Produto';
      const descLines = pdf.splitTextToSize(desc, 105);
      const cellHeight = descLines.length === 1 ? 5 : 5 + (descLines.length * 4);

      // Draw vertical lines from header to bottom of item
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      pdf.line(15, headerYPos, 15, yPos + cellHeight);  // Left border
      pdf.line(25, headerYPos, 25, yPos + cellHeight);  // Between Item and Qtd
      pdf.line(35, headerYPos, 35, yPos + cellHeight);  // Between Qtd e Descrição
      pdf.line(155, headerYPos, 155, yPos + cellHeight); // Between Descrição e V.Unit
      pdf.line(175, headerYPos, 175, yPos + cellHeight); // Between V.Unit e Valor
      pdf.line(195, headerYPos, 195, yPos + cellHeight); // Right border
      
      // Draw horizontal line at bottom
      pdf.line(15, yPos + cellHeight - 0.5, 195, yPos + cellHeight - 0.5);

      pdf.setFontSize(10.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      pdf.text(String(idx + 1), 17, yPos + 2.5);
      pdf.text(String(quantity), 28, yPos + 2.5);
      
      if (descLines.length === 1) {
        pdf.text(descLines[0], 40, yPos + 3.5);
      } else {
        pdf.text(descLines, 40, yPos + 2.5, { lineHeightFactor: 1.2 });
      }

      // Valor unitário
      const displayUnitPrice = unitPrice > 0 ? unitPrice : (amount / quantity);
      pdf.text('R$ ' + displayUnitPrice.toFixed(2).replace('.', ','), 166, yPos + (cellHeight / 2), { align: 'center' });
      
      pdf.text('R$ ' + subtotal.toFixed(2).replace('.', ','), 185, yPos + (cellHeight / 2), { align: 'center' });

      yPos += cellHeight;
    });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, 180, 5, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Subtotal Produtos:', 135, yPos + 3.5, { align: 'right' });
    pdf.text('R$ ' + productTotal.toFixed(2).replace('.', ','), 193, yPos + 3.5, { align: 'right' });
    yPos += 7;
  }

  // ===== DESCONTO SECTION =====
  const discountAmount = parseFloat(transaction.discountAmount?.toString() || '0');
  const originalAmount = parseFloat(transaction.originalAmount?.toString() || transaction.amount?.toString() || '0');
  const finalAmount = parseFloat(transaction.amount?.toString() || '0');

  if (discountAmount > 0) {
    pdf.setFillColor(255, 243, 224); // Light orange background
    pdf.rect(15, yPos, 180, 12, 'F');
    pdf.setDrawColor(255, 152, 0); // Orange border
    pdf.setLineWidth(0.5);
    pdf.rect(15, yPos, 180, 12);

    pdf.setFontSize(9);
    pdf.setTextColor(255, 87, 34); // Dark orange text
    pdf.setFont('Helvetica', 'bold');
    pdf.text('DESCONTO APLICADO', 18, yPos + 4);

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('-R$ ' + discountAmount.toFixed(2).replace('.', ','), 193, yPos + 4, { align: 'right' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Valor Original:', 135, yPos + 8, { align: 'right' });
    pdf.text('R$ ' + originalAmount.toFixed(2).replace('.', ','), 193, yPos + 8, { align: 'right' });

    yPos += 14;
  }

  // ===== TOTAL =====
  const totalAmount = finalAmount;

  pdf.setFillColor(...primaryRgb);
  pdf.rect(155, yPos, 40, 10, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('Helvetica', 'bold');
  const totalText = 'TOTAL R$ ' + totalAmount.toFixed(2).replace('.', ',');
  pdf.text(totalText, 175, yPos + 6.5, { align: 'center' });

  // ===== FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('Helvetica', 'normal');
  pdf.text(template.footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  const filename = 'NotaServico_' + (client?.name?.replace(/\s+/g, '_') || 'Cliente') + '_' + new Date().toISOString().split('T')[0] + '.pdf';
  
  const dataUrl = pdf.output('dataurlstring');
  return { dataUrl, filename };
}
