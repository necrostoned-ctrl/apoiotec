import jsPDF from 'jspdf';
import { getTemplateSettings } from './professionalPdfGenerator';

const formatDateForPDF = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }
  return [37, 99, 235];
}

export async function generateClientReportPDF(data: {
  clientName: string;
  services: any[];
  calls: any[];
  transactions: any[];
  startDate: Date;
  endDate: Date;
}): Promise<void> {
  try {
    const template = await getTemplateSettings();
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const primaryRgb = hexToRgb(template.primaryColor) as [number, number, number];
    
    const currentDate = new Date();
    const docNumber = `DOC-${currentDate.getTime()}`;
    
    let yPos = 15;

    // ===== HEADER =====
    pdf.setFillColor(...primaryRgb);
    pdf.rect(0, 0, pageWidth, 25, 'F');

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
    const phoneDisplay = template.pdfPhone2 ? `${template.pdfPhone1}, ${template.pdfPhone2}` : template.pdfPhone1;
    pdf.text(`CNPJ ${template.cnpj} - Telefone: ${phoneDisplay}`, 15, 18.5);

    // Número do documento e data no canto superior direito
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text(docNumber, pageWidth - 15, 10, { align: 'right' });

    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(formatDateForPDF(currentDate), pageWidth - 15, 16, { align: 'right' });

    yPos = 32;

    // ===== TÍTULO =====
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('RELATÓRIO POR CLIENTE', 15, yPos);
    yPos += 8;

    // ===== INFO CLIENTE E PERÍODO =====
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Cliente: ${data.clientName}`, 15, yPos);
    yPos += 6;

    const periodoText = `Período: ${formatDateForPDF(data.startDate)} a ${formatDateForPDF(data.endDate)}`;
    pdf.text(periodoText, 15, yPos);
    yPos += 10;

    // ===== CHAMADOS =====
    if (data.calls.length > 0) {
      pdf.setFontSize(11);
      pdf.setTextColor(...primaryRgb);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`CHAMADOS (${data.calls.length})`, 15, yPos);
      yPos += 7;

      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Header
      pdf.setFillColor(...primaryRgb);
      pdf.rect(15, yPos - 4, pageWidth - 30, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.text('Equipamento', 17, yPos);
      pdf.text('Tipo de Serviço', 65, yPos);
      pdf.text('Prioridade', 110, yPos);
      pdf.text('Status', 140, yPos);
      pdf.text('Data', 165, yPos);
      
      yPos += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      data.calls.forEach((call: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        
        const equip = String(call.equipment || '').substring(0, 40);
        const tipo = String(call.serviceType || '').substring(0, 35);
        const prior = String(call.priority || '').substring(0, 10);
        const status = String(call.status || '').substring(0, 15);
        const data = formatDateForPDF(call.createdAt);

        pdf.text(equip, 17, yPos);
        pdf.text(tipo, 65, yPos);
        pdf.text(prior, 110, yPos);
        pdf.text(status, 140, yPos);
        pdf.text(data, 165, yPos);
        yPos += 6;
      });

      yPos += 5;
    }

    // ===== SERVIÇOS =====
    if (data.services.length > 0) {
      if (yPos > pageHeight - 35) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(...primaryRgb);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`SERVIÇOS (${data.services.length})`, 15, yPos);
      yPos += 7;

      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Header
      pdf.setFillColor(...primaryRgb);
      pdf.rect(15, yPos - 4, pageWidth - 30, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.text('Serviço', 17, yPos);
      pdf.text('Data', 100, yPos);
      pdf.text('Valor', 165, yPos, { align: 'right' });
      
      yPos += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      data.services.forEach((service: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        
        const nome = String(service.name || '').substring(0, 75);
        const data = formatDateForPDF(service.createdAt);
        const valor = `R$ ${(service.registrationFee || 0).toFixed(2).replace('.', ',')}`;

        pdf.text(nome, 17, yPos);
        pdf.text(data, 100, yPos);
        pdf.text(valor, 175, yPos, { align: 'right' });
        yPos += 6;
      });

      yPos += 5;
    }

    // ===== FINANCEIRO =====
    if (data.transactions.length > 0) {
      if (yPos > pageHeight - 35) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(...primaryRgb);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`FINANCEIRO (${data.transactions.length})`, 15, yPos);
      yPos += 7;

      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      // Header
      pdf.setFillColor(...primaryRgb);
      pdf.rect(15, yPos - 4, pageWidth - 30, 6, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.text('Descrição', 17, yPos);
      pdf.text('Tipo', 95, yPos);
      pdf.text('Data', 120, yPos);
      pdf.text('Status', 145, yPos);
      pdf.text('Valor', 165, yPos, { align: 'right' });
      
      yPos += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      data.transactions.forEach((trans: any) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        
        const desc = String(trans.description || '').substring(0, 70);
        const tipo = trans.type === 'income' ? 'Receita' : 'Despesa';
        const data = formatDateForPDF(trans.billingDate || trans.date || trans.createdAt);
        const status = trans.status === 'pago' ? 'Pago' : 'Pendente';
        const valor = `R$ ${(trans.amount || 0).toFixed(2).replace('.', ',')}`;

        pdf.text(desc, 17, yPos);
        pdf.text(tipo, 95, yPos);
        pdf.text(data, 120, yPos);
        pdf.text(status, 145, yPos);
        pdf.text(valor, 175, yPos, { align: 'right' });
        yPos += 6;
      });
    }

    // ===== FOOTER =====
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Documento emitido pelo sistema Apoiotec Informática', pageWidth / 2, footerY, { align: 'center' });

    // Download
    const filename = `Relatorio_${data.clientName.replace(/\s+/g, '_')}_${formatDateForPDF(new Date()).replace(/\//g, '-')}.pdf`;
    pdf.save(filename);
    
    console.log("✅ [PDF-GERADO]", filename);
  } catch (error) {
    console.error("❌ [PDF-ERRO]", error);
    throw error;
  }
}
