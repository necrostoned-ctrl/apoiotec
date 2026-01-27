import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClientFilter } from "@/components/ClientFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Download, ArrowLeft, Search, FileText, Package, Users, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PDFViewer } from "@/components/PDFViewer";
import type { Service, Client, FinancialTransactionWithClient, Call } from "@shared/schema";

// Função para gerar PDF com retorno de dataUrl
async function generateClientReportPDF(data: {
  clientName: string;
  services: any[];
  calls: any[];
  transactions: any[];
  startDate: Date;
  endDate: Date;
}): Promise<{ dataUrl: string; filename: string }> {
  try {
    // Validar dados de entrada
    if (!data || !Array.isArray(data.services) || !Array.isArray(data.calls) || !Array.isArray(data.transactions)) {
      throw new Error("Dados inválidos fornecidos ao gerador de PDF");
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const formatDateForPDF = (date: Date | string | null | undefined): string => {
      try {
        if (!date) return "N/A";
        const dateObj = typeof date === "string" ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return "N/A";
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return "N/A";
      }
    };

    // Helper para desenhar células com texto quebrado
    const drawTableRow = (
      pdf: any,
      rowY: any,
      colWidths: any,
      texts: any[],
      startX: number = 15
    ) => {
      const lineHeight = 4;
      const maxLines = 10;
      const colKeys = Object.keys(colWidths);
      
      // Calcular altura necessária
      let maxRowHeight = 6;
      const colTexts = texts.map((text, idx) => {
        let width = colWidths[colKeys[idx]];
        
        // Aplicar margem de segurança específica por coluna
        if (colKeys[idx] === 'descricao' || colKeys[idx] === 'servico') {
          // Para as colunas de descrição e serviço, reduzir agressivamente para evitar invasão
          // Reduzir em 28mm para garantir quebra segura antes do valor
          width = Math.max(width - 28, 80);
        } else {
          // Para outras colunas, margem de 4mm
          width = Math.max(width - 4, width * 0.9);
        }
        
        const lines = (pdf as any).splitTextToSize(String(text || ''), width);
        const height = lines.length * lineHeight;
        maxRowHeight = Math.max(maxRowHeight, height + 1.5);
        return lines;
      });

      // Background expandido
      const totalWidth = Object.values(colWidths).reduce((a: any, b: any) => a + b, 0);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(startX, rowY, totalWidth, maxRowHeight, 'F');

      // Grades
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.1);
      let lineX = startX;
      const colValues = Object.values(colWidths) as number[];
      for (let i = 0; i <= colValues.length; i++) {
        if (i === 0) lineX = startX;
        else lineX = startX + colValues.slice(0, i).reduce((a: number, b: number) => a + b, 0);
        pdf.line(lineX, rowY, lineX, rowY + maxRowHeight);
      }
      pdf.line(startX, rowY, startX + (totalWidth as number), rowY);
      pdf.line(startX, rowY + maxRowHeight, startX + (totalWidth as number), rowY + maxRowHeight);

      // Texto multi-linha
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      let xPos = startX;
      colTexts.forEach((lines: any, idx: number) => {
        const width = colWidths[Object.keys(colWidths)[idx]];
        let yOffset = rowY + 3;
        lines.forEach((line: any) => {
          if (idx === Object.keys(colWidths).length - 1) {
            pdf.text(line, xPos + width - 2, yOffset, { align: 'right' });
          } else {
            pdf.text(line, xPos + 2, yOffset);
          }
          yOffset += lineHeight;
        });
        xPos += width;
      });

      return maxRowHeight;
    };

    let yPos = 15;

    // HEADER
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 25, 'F');

    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Apoiotec Informática', 15, 10);

    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Assessoria e Assistência Técnica em Informática', 15, 14.5);

    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('CNPJ 15.292.813.0001-70 - Telefone: 84988288543, 84988363828', 15, 18.5);

    // Título no canto superior direito
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('RELATÓRIO POR CLIENTE', pageWidth - 15, 10, { align: 'right' });

    // Período no canto superior direito (logo abaixo do título)
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('Helvetica', 'normal');
    const periodoText = `${formatDateForPDF(data.startDate)} a ${formatDateForPDF(data.endDate)}`;
    pdf.text(periodoText, pageWidth - 15, 16, { align: 'right' });

    yPos = 32;

    // BOX COM CLIENTE APENAS
    const boxWidth = pageWidth - 30;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPos, boxWidth, 10, 'F');
    
    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(0.5);
    pdf.rect(15, yPos, boxWidth, 10);

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Cliente: ${data.clientName}`, 18, yPos + 5.5);
    
    yPos += 15;

    // CHAMADOS com grades profissionais - PADRÃO PROFESIONAL
    if (data.calls.length > 0) {
      pdf.setFontSize(11);
      pdf.setTextColor(37, 99, 235);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`CHAMADOS (${data.calls.length})`, 15, yPos);
      yPos += 7;

      // Define column widths (FIXO - mesmo tamanho do boxWidth acima)
      const callColWidths = {
        data: 22,
        descricao: 136,
        prioridade: 22
      };

      const callTotalWidth = callColWidths.data + callColWidths.descricao + callColWidths.prioridade;

      // HEADER
      const callHeaderY = yPos;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(15, yPos, callTotalWidth, 7, 'F');

      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');

      let callXPos = 15;
      pdf.text('Data', callXPos + 2, yPos + 5);
      callXPos += callColWidths.data;
      pdf.text('Descrição', callXPos + 2, yPos + 5);
      callXPos += callColWidths.descricao;
      pdf.text('Prioridade', 15 + callTotalWidth - 2, yPos + 5, { align: 'right' });

      yPos += 8;

      // LINHAS DE DADOS
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      data.calls.forEach((call: any) => {
        try {
          const rowHeight = drawTableRow(pdf, yPos, callColWidths, [
            formatDateForPDF(call.createdAt),
            String(call.description || 'Sem descrição'),
            String(call.priority || 'N/A')
          ]);
          
          yPos += rowHeight;
          
          if (yPos > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
            
            // Repetir header
            pdf.setFillColor(37, 99, 235);
            pdf.rect(15, yPos, callTotalWidth, 7, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('Helvetica', 'bold');
            
            callXPos = 15;
            pdf.text('Data', callXPos + 2, yPos + 5);
            callXPos += callColWidths.data;
            pdf.text('Descrição', callXPos + 2, yPos + 5);
            callXPos += callColWidths.descricao;
            pdf.text('Prioridade', 15 + callTotalWidth - 2, yPos + 5, { align: 'right' });
            
            yPos += 8;
          }
        } catch (err) {
          // Silenciar erros individuais de linhas
        }
      });

      yPos += 5;
    }

    // SERVIÇOS com grades profissionais - PADRÃO PROFESIONAL
    if (data.services.length > 0) {
      if (yPos > pageHeight - 35) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(37, 99, 235);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`SERVIÇOS (${data.services.length})`, 15, yPos);
      yPos += 7;

      // Define column widths (FIXO - mesmo tamanho do boxWidth acima)
      // REFERÊNCIA PARA LARGURA DE COLUNA VALOR: 22mm
      const srvColWidths = {
        data: 22,
        servico: 136,
        valor: 22
      };

      const srvTotalWidth = srvColWidths.data + srvColWidths.servico + srvColWidths.valor;

      // HEADER
      const srvHeaderY = yPos;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(15, yPos, srvTotalWidth, 7, 'F');

      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');

      let srvXPos = 15;
      pdf.text('Data', srvXPos + 2, yPos + 5);
      srvXPos += srvColWidths.data;
      pdf.text('Serviço', srvXPos + 2, yPos + 5);
      srvXPos += srvColWidths.servico;
      pdf.text('Valor', 15 + srvTotalWidth - 2, yPos + 5, { align: 'right' });

      yPos += 8;

      // LINHAS DE DADOS
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      data.services.forEach((service: any) => {
        try {
          const regFee = parseFloat(String(service.registrationFee || 0));
          const valor = `R$ ${isNaN(regFee) ? '0,00' : regFee.toFixed(2).replace('.', ',')}`;
          
          const rowHeight = drawTableRow(pdf, yPos, srvColWidths, [
            formatDateForPDF(service.createdAt),
            String(service.name || 'Sem nome'),
            valor
          ]);
          
          yPos += rowHeight;
          
          if (yPos > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
            
            
            // Repetir header
            pdf.setFillColor(37, 99, 235);
            pdf.rect(15, yPos, srvTotalWidth, 7, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('Helvetica', 'bold');
            
            srvXPos = 15;
            pdf.text('Data', srvXPos + 2, yPos + 5);
            srvXPos += srvColWidths.data;
            pdf.text('Serviço', srvXPos + 2, yPos + 5);
            srvXPos += srvColWidths.servico;
            pdf.text('Valor', 15 + srvTotalWidth - 2, yPos + 5, { align: 'right' });
            
            yPos += 8;
          }
        } catch (err) {
          // Silenciar erros individuais de linhas
        }
      });

      yPos += 5;
    }

    // FINANCEIRO com grades profissionais - PADRÃO PROFESIONAL
    if (data.transactions.length > 0) {
      if (yPos > pageHeight - 35) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(11);
      pdf.setTextColor(37, 99, 235);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`FINANCEIRO (${data.transactions.length})`, 15, yPos);
      yPos += 7;

      // Define column widths (FIXO - mesmo tamanho do boxWidth acima)
      // PARAMETRIZADO COM SERVIÇOS: coluna valor = 22mm
      const finColWidths = {
        data: 22,
        descricao: 136,
        valor: 22
      };

      const finTotalWidth = finColWidths.data + finColWidths.descricao + finColWidths.valor;

      // HEADER
      const finHeaderY = yPos;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(15, yPos, finTotalWidth, 7, 'F');

      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');

      let finXPos = 15;
      pdf.text('Data', finXPos + 2, yPos + 5);
      finXPos += finColWidths.data;
      pdf.text('Descrição', finXPos + 2, yPos + 5);
      finXPos += finColWidths.descricao;
      pdf.text('Valor', 15 + finTotalWidth - 2, yPos + 5, { align: 'right' });

      yPos += 8;

      // LINHAS DE DADOS
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('Helvetica', 'normal');

      let totalValue = 0;
      let totalDiscount = 0;

      // Helper para enriquecer descrição com serviços e produtos
      const enrichDescription = (trans: any): string => {
        try {
          let desc = String(trans.description || 'Sem descrição');
          const parts: string[] = [desc];

          // Adicionar serviços
          if (trans.serviceDetails) {
            try {
              const services = typeof trans.serviceDetails === 'string' 
                ? JSON.parse(trans.serviceDetails) 
                : trans.serviceDetails;
              if (Array.isArray(services) && services.length > 0) {
                const serviceNames = services.map((s: any) => s.name || s.description || 'Serviço').join(', ');
                parts.push(`Serviços: ${serviceNames}`);
              }
            } catch (e) {
              // Ignorar erro de parse
            }
          }

          // Adicionar produtos
          if (trans.productDetails) {
            try {
              const products = typeof trans.productDetails === 'string' 
                ? JSON.parse(trans.productDetails) 
                : trans.productDetails;
              if (Array.isArray(products) && products.length > 0) {
                const productNames = products.map((p: any) => p.name || p.description || 'Produto').join(', ');
                parts.push(`Produtos: ${productNames}`);
              }
            } catch (e) {
              // Ignorar erro de parse
            }
          }

          return parts.join(' | ');
        } catch (error) {
          return String(trans.description || 'Sem descrição');
        }
      };

      data.transactions.forEach((trans: any) => {
        try {
          const amount = parseFloat(String(trans.amount || 0)) || 0;
          const discountAmount = parseFloat(String(trans.discountAmount || 0)) || 0;
          const preDiscountValue = amount + discountAmount; // Valor ANTES do desconto
          const valorStr = `R$ ${preDiscountValue.toFixed(2).replace('.', ',')}`;
          
          const rowHeight = drawTableRow(pdf, yPos, finColWidths, [
            formatDateForPDF(trans.billingDate || trans.date || trans.createdAt),
            enrichDescription(trans),
            valorStr
          ]);
          
          yPos += rowHeight;
          totalValue += amount; // Acumula valor final (após desconto)
          totalDiscount += discountAmount; // Acumula desconto
          
          if (yPos > pageHeight - 25) {
            pdf.addPage();
            yPos = 20;
            
            // Repetir header
            pdf.setFillColor(37, 99, 235);
            pdf.rect(15, yPos, finTotalWidth, 7, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('Helvetica', 'bold');
            
            finXPos = 15;
            pdf.text('Data', finXPos + 2, yPos + 5);
            finXPos += finColWidths.data;
            pdf.text('Descrição', finXPos + 2, yPos + 5);
            finXPos += finColWidths.descricao;
            pdf.text('Valor', 15 + finTotalWidth - 2, yPos + 5, { align: 'right' });
            
            yPos += 8;
          }
        } catch (err) {
          // Silenciar erros individuais de linhas
        }
      });

      // BOX DE DESCONTO LARANJA - Se houver descontos (APARECE PRIMEIRO/MAIS PARA CIMA)
      yPos += 3;
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }

      if (totalDiscount > 0) {
        // Fundo laranja (mesmo estilo das notas de serviço)
        pdf.setFillColor(254, 243, 224);
        pdf.rect(15, yPos, finTotalWidth, 16, 'F');
        
        // Borda laranja fina
        pdf.setDrawColor(255, 152, 0); // Orange border
        pdf.setLineWidth(0.5);
        pdf.rect(15, yPos, finTotalWidth, 16);

        // Título "DESCONTO APLICADO" no canto superior esquerdo
        pdf.setFontSize(10);
        pdf.setTextColor(255, 87, 34); // Orange text color
        pdf.setFont('Helvetica', 'bold');
        pdf.text('DESCONTO APLICADO', 20, yPos + 4);

        // Valor do desconto em cima na direita (-R$ XXXX,XX)
        pdf.setFontSize(10);
        pdf.setTextColor(255, 87, 34);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('-R$ ' + totalDiscount.toFixed(2).replace('.', ','), 15 + finTotalWidth - 5, yPos + 4, { align: 'right' });
        
        // "Valor Original:" embaixo na esquerda
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('Helvetica', 'normal');
        pdf.text('Valor Original:', 20, yPos + 11);
        
        // Valor original em cima na direita (R$ XXXX,XX)
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('Helvetica', 'bold');
        const originalAmount = totalValue + totalDiscount; // Valor antes do desconto
        pdf.text('R$ ' + originalAmount.toFixed(2).replace('.', ','), 15 + finTotalWidth - 5, yPos + 11, { align: 'right' });
        
        yPos += 18;
      }

      // BOX DE TOTAL AZUL - 1/3 da largura logo abaixo do desconto, alinhado à direita
      const boxAzulWidth = finTotalWidth / 3; // 1/3 da largura
      const boxAzulX = 15 + finTotalWidth - boxAzulWidth; // Alinhado à direita
      const boxAzulY = yPos; // Logo abaixo do box laranja

      pdf.setFillColor(37, 99, 235);
      pdf.rect(boxAzulX, boxAzulY, boxAzulWidth, 12, 'F');
      
      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.5);
      pdf.rect(boxAzulX, boxAzulY, boxAzulWidth, 12);

      // Valor total centralizado no box
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`VALOR TOTAL`, boxAzulX + (boxAzulWidth / 2), boxAzulY + 3.5, { align: 'center' });
      pdf.text(`R$ ${totalValue.toFixed(2).replace('.', ',')}`, boxAzulX + (boxAzulWidth / 2), boxAzulY + 9, { align: 'center' });
      
      yPos += 14;
    }

    // FOOTER
    const footerY = pageHeight - 10;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Documento emitido pelo sistema Apoiotec Informática', pageWidth / 2, footerY, { align: 'center' });

    const filename = `Relatorio_${data.clientName.replace(/\s+/g, '_')}_${formatDateForPDF(new Date()).replace(/\//g, '-')}.pdf`;
    const dataUrl = pdf.output('dataurlstring');
    
    return { dataUrl, filename };
  } catch (error) {
    console.error("❌ [PDF-ERRO]", error);
    // Retornar PDF mesmo com erros secundários - erros individuais de linhas não devem impedir a geração
    // Tentar retornar um PDF vazio em vez de falhar completamente
    try {
      const fallbackPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      fallbackPdf.setFontSize(14);
      fallbackPdf.text('Erro ao gerar relatório completo', 15, 20);
      const dataUrl = fallbackPdf.output('dataurlstring');
      const filename = `Relatorio_${data.clientName.replace(/\s+/g, '_')}_erro.pdf`;
      return { dataUrl, filename };
    } catch {
      throw error;
    }
  }
}

export default function ReportsCliente() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [periodFilter, setPeriodFilter] = useState("este-mes");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [reportType, setReportType] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfData, setPdfData] = useState<{ dataUrl: string; filename: string } | null>(null);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: calls = [] } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: transactions = [] } = useQuery<FinancialTransactionWithClient[]>({
    queryKey: ["/api/financial-transactions"],
  });

  const getPeriodDates = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (periodFilter) {
      case "hoje":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "esta-semana":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "este-mes":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "mes-passado":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "ultimo-trimestre":
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      case "este-ano":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "todos-os-periodos":
        startDate = new Date(1970, 0, 1);
        endDate = new Date(now);
        break;
      case "periodo-personalizado":
        // Usar datas personalizadas
        if (customStartDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        if (customEndDate) {
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const filteredServices = services.filter((service: any) => {
    try {
      if (clientId === null) return false;
      
      const { startDate, endDate } = getPeriodDates();
      const serviceDate = new Date(service.createdAt);
      
      const matchesClient = String(service.clientId) === String(clientId);
      const matchesPeriod = serviceDate >= startDate && serviceDate <= endDate;

      return matchesClient && matchesPeriod;
    } catch (error) {
      console.error("❌ [FILTER-ERROR]", error);
      return false;
    }
  });

  const filteredCalls = calls.filter((call: any) => {
    try {
      if (clientId === null) return false;
      
      const { startDate, endDate } = getPeriodDates();
      const callDate = new Date(call.createdAt);
      
      const matchesClient = String(call.clientId) === String(clientId);
      const matchesPeriod = callDate >= startDate && callDate <= endDate;

      return matchesClient && matchesPeriod;
    } catch (error) {
      console.error("❌ [CALL-FILTER-ERROR]", error);
      return false;
    }
  });

  const filteredTransactions = transactions.filter((transaction: any) => {
    try {
      if (clientId === null) return false;
      
      const { startDate, endDate } = getPeriodDates();
      const transDate = new Date(transaction.billingDate || transaction.date || transaction.createdAt);
      
      const matchesClient = String(transaction.clientId) === String(clientId);
      const matchesPeriod = transDate >= startDate && transDate <= endDate;
      const matchesStatus = statusFilter === "todos" || transaction.status === statusFilter;

      return matchesClient && matchesPeriod && matchesStatus;
    } catch (error) {
      console.error("❌ [FILTER-ERROR]", error);
      return false;
    }
  });

  const generatePDF = async () => {
    try {
      if (clientId === null) {
        toast({
          title: "Aviso",
          description: "Por favor, selecione um cliente",
          variant: "destructive"
        });
        return;
      }

      const selectedClient = clients?.find?.((c: any) => c?.id === clientId);
      if (!selectedClient) {
        console.warn("⚠️ Cliente não encontrado:", clientId);
        toast({
          title: "Aviso",
          description: "Cliente não encontrado",
          variant: "destructive"
        });
        return;
      }
      
      const { startDate, endDate } = getPeriodDates();
      
      const result = await generateClientReportPDF({
        clientName: selectedClient?.name || "Cliente Desconhecido",
        services: reportType === "todos" || reportType === "servicos" ? filteredServices : [],
        calls: reportType === "todos" || reportType === "chamados" ? filteredCalls : [],
        transactions: reportType === "todos" || reportType === "financeiro" ? filteredTransactions : [],
        startDate,
        endDate,
      });

      if (result) {
        setPdfData(result);
        setPdfViewerOpen(true);
      }

      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!"
      });
    } catch (error) {
      console.error("❌ [PDF-ERRO COMPLETO]", {
        error,
        errorString: String(error),
        stack: error instanceof Error ? error.stack : 'sem stack'
      });
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF: " + String(error),
        variant: "destructive"
      });
    }
  };

  let totalServicesValue = 0;
  let totalTransactionsIncome = 0;
  let totalTransactionsExpense = 0;
  
  try {
    totalServicesValue = Array.isArray(filteredServices) ? filteredServices.reduce((sum: number, s: any) => sum + (s?.registrationFee || 0), 0) : 0;
    totalTransactionsIncome = Array.isArray(filteredTransactions) ? filteredTransactions
      .filter((t: any) => t?.type === "entrada")
      .reduce((sum: number, t: any) => sum + (parseFloat(t?.amount || 0)), 0) : 0;
    totalTransactionsExpense = Array.isArray(filteredTransactions) ? filteredTransactions
      .filter((t: any) => t?.type === "saida")
      .reduce((sum: number, t: any) => sum + (parseFloat(t?.amount || 0)), 0) : 0;
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
  }

  const selectedClient = clientId ? clients?.find?.((c: any) => c?.id === clientId) : null;

  return (
    <>
    <PDFViewer 
      open={pdfViewerOpen} 
      onOpenChange={setPdfViewerOpen} 
      pdfDataUrl={pdfData?.dataUrl || ""} 
      filename={pdfData?.filename || "relatorio.pdf"}
    />
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      <Link href="/reports">
        <Button variant="outline" className="border-neon text-neon hover:bg-neon/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Menu de Relatórios
        </Button>
      </Link>

      <Card className="border-4 border-blue-500 bg-black">
        <CardHeader>
          <CardTitle className="text-blue-400">Relatório por Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <ClientFilter
                value={clientId ? String(clientId) : ""}
                onChange={(val) => {
                  try {
                    if (!val || val === "") {
                      setClientId(null);
                      return;
                    }
                    const numId = parseInt(val);
                    if (!isNaN(numId)) {
                      setClientId(numId);
                    }
                  } catch (error) {
                    console.error("Erro ao selecionar cliente:", error);
                    setClientId(null);
                  }
                }}
                placeholder="Selecionar..."
                showClearAll={false}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="esta-semana">Esta Semana</SelectItem>
                  <SelectItem value="este-mes">Este Mês</SelectItem>
                  <SelectItem value="mes-passado">Mês Passado</SelectItem>
                  <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="este-ano">Este Ano</SelectItem>
                  <SelectItem value="todos-os-periodos">Todos os Períodos</SelectItem>
                  <SelectItem value="periodo-personalizado">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodFilter === "periodo-personalizado" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-neon bg-gray-800 text-white"
                    data-testid="input-custom-start-date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-neon bg-gray-800 text-white"
                    data-testid="input-custom-end-date"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="chamados">Chamados</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-neon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  console.log("🎯 [BOTAO-PDF] Clicado! Gerando PDF...");
                  generatePDF();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 border-4 border-indigo-500 dark:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/50 dark:shadow-indigo-500/20 shadow-lg font-bold text-lg py-3 transition-all"
                disabled={false}
              >
                <Download className="w-6 h-6 mr-2" />
                Gerar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHAMADOS */}
      {(reportType === "todos" || reportType === "chamados") && clientId && (
        <Card className="border-4 border-yellow-400 bg-black">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2"><FileText className="h-5 w-5 text-yellow-500" /> Chamados ({filteredCalls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum chamado encontrado com os filtros selecionados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neon/30">
                      <TableHead className="text-neon">Equipamento</TableHead>
                      <TableHead className="text-neon">Tipo de Serviço</TableHead>
                      <TableHead className="text-neon">Prioridade</TableHead>
                      <TableHead className="text-neon">Status</TableHead>
                      <TableHead className="text-neon">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.map((call: any) => (
                      <TableRow key={call.id} className="border-neon/20">
                        <TableCell className="text-white">{call.equipment}</TableCell>
                        <TableCell className="text-white">{call.serviceType}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            call.priority === "alta" ? "border-red-500 text-red-400" :
                            call.priority === "media" ? "border-yellow-500 text-yellow-400" :
                            "border-green-500 text-green-400"
                          }>
                            {call.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-neon text-neon">
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{formatDate(call.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SERVIÇOS */}
      {(reportType === "todos" || reportType === "servicos") && clientId && (
        <Card className="border-4 border-blue-500 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-400">
              <span className="flex items-center gap-2"><Package className="h-5 w-5 text-blue-500" /> Serviços ({filteredServices.length})</span>
              <div className="text-sm font-normal text-white">
                Total: <span className="text-blue-400">{formatCurrency(totalServicesValue)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhum serviço encontrado com os filtros selecionados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neon/30">
                      <TableHead className="text-neon">Data</TableHead>
                      <TableHead className="text-neon">Serviço</TableHead>
                      <TableHead className="text-right text-neon">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service: any) => (
                      <TableRow key={service.id} className="border-neon/20">
                        <TableCell className="text-white">{formatDate(service.createdAt)}</TableCell>
                        <TableCell className="text-white">{service.name}</TableCell>
                        <TableCell className="text-right text-neon font-semibold">
                          {formatCurrency(service.registrationFee || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FINANCEIRO */}
      {(reportType === "todos" || reportType === "financeiro") && clientId && (
        <Card className="border-4 border-green-500 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-green-400">
              <span className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /> Financeiro ({filteredTransactions.length})</span>
              <div className="text-sm font-normal text-white space-x-4">
                <span>Receita: <span className="text-green-400 font-bold">{formatCurrency(totalTransactionsIncome)}</span></span>
                <span>Despesa: <span className="text-red-400 font-bold">{formatCurrency(totalTransactionsExpense)}</span></span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Nenhuma transação encontrada com os filtros selecionados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neon/30">
                      <TableHead className="text-neon">Data</TableHead>
                      <TableHead className="text-neon">Descrição</TableHead>
                      <TableHead className="text-neon">Tipo</TableHead>
                      <TableHead className="text-neon">Status</TableHead>
                      <TableHead className="text-right text-neon">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id} className="border-neon/20">
                        <TableCell className="text-white">{formatDate(transaction.billingDate || transaction.date || transaction.createdAt)}</TableCell>
                        <TableCell className="text-white">{transaction.description || "Sem descrição"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={transaction.type === "entrada" ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}>
                            {transaction.type === "entrada" ? "Receita" : "Despesa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={transaction.status === "pago" ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"}>
                            {transaction.status === "pago" ? "Pago" : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold" style={{color: transaction.type === "entrada" ? "#00ff41" : "#ff4444"}}>
                          {formatCurrency(transaction.amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
