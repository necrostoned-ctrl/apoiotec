import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import QRCode from 'qrcode';

export interface CertificateInfo {
  name: string;
  subjectName: string;
  issuerName: string;
  serialNumber: string;
  cnpj: string | null;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
  daysUntilExpiry: number;
  status: 'active' | 'warning' | 'expired';
}

export interface SignatureResult {
  success: boolean;
  signedPdfBuffer?: Buffer;
  error?: string;
}

export interface VisualSignatureInfo {
  signerName: string;
  cnpj: string | null;
  signedAt: Date;
}

const CERTIFICATE_DIR = process.env.CERTIFICATE_DIR || (
  process.env.NODE_ENV === 'production' 
    ? '/home/aptc/sistemaapoiotec/TechSupportManager/certs'
    : path.join(process.cwd(), 'certs')
);

export function validateCertificatePassword(certificatePath: string, password: string): { valid: boolean; error?: string; info?: CertificateInfo } {
  try {
    const pfxBuffer = fs.readFileSync(certificatePath);
    // Converter Buffer para string binária corretamente
    const pfxBinary = Array.from(pfxBuffer).map((byte) => String.fromCharCode(byte)).join('');
    const pfxAsn1 = forge.asn1.fromDer(pfxBinary);
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);
    
    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag];
    
    if (!certBag || certBag.length === 0) {
      return { valid: false, error: 'Nenhum certificado encontrado no arquivo' };
    }
    
    const cert = certBag[0].cert;
    if (!cert) {
      return { valid: false, error: 'Certificado inválido' };
    }
    
    const info = extractCertificateInfo(cert);
    
    if (info.status === 'expired') {
      return { valid: false, error: 'Certificado expirado', info };
    }
    
    return { valid: true, info };
  } catch (error: any) {
    if (error.message?.includes('Invalid password') || error.message?.includes('PKCS#12')) {
      return { valid: false, error: 'Senha incorreta' };
    }
    return { valid: false, error: `Erro ao validar certificado: ${error.message}` };
  }
}

export function extractCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
  const subject = cert.subject.attributes;
  const issuer = cert.issuer.attributes;
  
  const getAttr = (attrs: any[], shortName: string) => {
    const attr = attrs.find(a => a.shortName === shortName);
    return attr?.value || '';
  };
  
  let subjectCN = getAttr(subject, 'CN');
  const issuerCN = getAttr(issuer, 'CN');
  const issuerO = getAttr(issuer, 'O');
  
  // Extrair CNPJ do nome se estiver no formato "NOME:CNPJ"
  let cnpj: string | null = null;
  
  // Primeiro tenta encontrar CNPJ formatado (XX.XXX.XXX/XXXX-XX)
  for (const attr of subject) {
    if (attr.value && typeof attr.value === 'string') {
      const cnpjMatch = attr.value.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
      if (cnpjMatch) {
        cnpj = cnpjMatch[0];
        break;
      }
    }
  }
  
  // Se não encontrou, tenta extrair do nome (NOME:CNPJ sem formatação)
  if (!cnpj && subjectCN.includes(':')) {
    const parts = subjectCN.split(':');
    const potentialCnpj = parts[parts.length - 1].trim();
    
    // Valida se é um CNPJ (14 dígitos)
    if (/^\d{14}$/.test(potentialCnpj)) {
      cnpj = potentialCnpj;
      // Remove o CNPJ do nome
      subjectCN = parts.slice(0, -1).join(':').trim();
    }
  }
  
  // Formata o CNPJ se foi extraído sem formatação
  if (cnpj && !cnpj.includes('.')) {
    // Formata: 00623949000148 -> 00.623.949/0001-48
    cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  const validFrom = cert.validity.notBefore;
  const validTo = cert.validity.notAfter;
  const now = new Date();
  const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'active' | 'warning' | 'expired' = 'active';
  if (daysUntilExpiry <= 0) {
    status = 'expired';
  } else if (daysUntilExpiry <= 30) {
    status = 'warning';
  }
  
  return {
    name: subjectCN,
    subjectName: subjectCN,
    issuerName: issuerO || issuerCN,
    serialNumber: cert.serialNumber,
    cnpj,
    validFrom,
    validTo,
    isValid: status !== 'expired',
    daysUntilExpiry,
    status
  };
}

export function getCertificateInfoFromFile(certificatePath: string, password: string): CertificateInfo | null {
  try {
    const result = validateCertificatePassword(certificatePath, password);
    return result.info || null;
  } catch {
    return null;
  }
}

export function addVisualSignatureMark(
  pdfDoc: any,
  signatureInfo: VisualSignatureInfo,
  pageIndex: number,
  page: any
): void {
  const { width, height } = page.getSize();
  
  const boxWidth = 220;
  const boxHeight = 70;
  const margin = 20;
  const x = margin;
  const y = margin;
  
  page.drawRectangle({
    x: x,
    y: y,
    width: boxWidth,
    height: boxHeight,
    borderColor: { r: 0, g: 0.6, b: 0.3 },
    borderWidth: 1.5,
  });
  
  const fontSize = 8;
  const lineHeight = 10;
  
  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
  };
  
  const lines = [
    'Assinado digitalmente por:',
    signatureInfo.signerName.substring(0, 35),
    signatureInfo.cnpj ? `CNPJ: ${signatureInfo.cnpj}` : '',
    `Data: ${formatDateTime(signatureInfo.signedAt)}`,
    '✓ Assinatura digital válida'
  ].filter(l => l);
  
  let currentY = y + boxHeight - 12;
  for (const line of lines) {
    page.drawText(line, {
      x: x + 8,
      y: currentY,
      size: fontSize,
      color: { r: 0, g: 0.4, b: 0.2 },
    });
    currentY -= lineHeight;
  }
}

export function ensureCertificateDirectory(): void {
  if (!fs.existsSync(CERTIFICATE_DIR)) {
    fs.mkdirSync(CERTIFICATE_DIR, { recursive: true });
  }
}

export function getCertificatePath(filename: string): string {
  return path.join(CERTIFICATE_DIR, filename);
}

export function listCertificateFiles(): string[] {
  ensureCertificateDirectory();
  try {
    const files = fs.readdirSync(CERTIFICATE_DIR);
    return files.filter(f => f.endsWith('.pfx') || f.endsWith('.p12'));
  } catch {
    return [];
  }
}

export function deleteCertificateFile(filename: string): boolean {
  try {
    const filepath = getCertificatePath(filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function signPdfWithCertificate(
  pdfBuffer: Buffer,
  certificatePath: string,
  password: string,
  signerInfo: VisualSignatureInfo
): Promise<SignatureResult> {
  try {
    console.log('🔒 [ASSINATURA CRIPTOGRÁFICA] Iniciando...');
    console.log('📄 Buffer size:', pdfBuffer.length, 'bytes');

    // 1. Importar bibliotecas de assinatura criptográfica
    const signpdf = (await import('@signpdf/signpdf')).default;
    const { P12Signer } = await import('@signpdf/signer-p12');
    const { plainAddPlaceholder } = await import('@signpdf/placeholder-plain');
    console.log('📦 Bibliotecas de assinatura importadas');

    // 2. Ler certificado PKCS12
    const certificateBuffer = fs.readFileSync(certificatePath);
    console.log('🔐 Certificado carregado:', certificateBuffer.length, 'bytes');

    // 3. Formatar data/hora para placeholder
    const formatDateTime = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    };

    // 4. Preparar dados de assinatura para placeholder
    let reasonText = `Documento assinado digitalmente por ${signerInfo.signerName}`;
    if (signerInfo.cnpj) {
      reasonText += ` (CNPJ: ${signerInfo.cnpj})`;
    }
    reasonText += ` em ${formatDateTime(signerInfo.signedAt)}`;

    console.log('📋 [ASSINATURA] Dados:');
    console.log('  - Nome:', signerInfo.signerName);
    console.log('  - CNPJ:', signerInfo.cnpj);
    console.log('  - Data:', signerInfo.signedAt);

    // 5. Adicionar placeholder de assinatura ao PDF
    console.log('📌 Adicionando placeholder de assinatura...');
    let pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer: pdfBuffer,
      reason: 'Assinatura Digital',
      contactInfo: signerInfo.cnpj || 'N/A',
      name: signerInfo.signerName,
      location: 'Brasil',
      signatureLength: 8192
    });
    console.log('✅ Placeholder adicionado');

    // 6. Criar assinador com certificado
    console.log('🔓 Validando certificado com senha...');
    let signer;
    try {
      signer = new P12Signer(certificateBuffer, {
        passphrase: password
      });
      console.log('✅ Assinador criado com sucesso');
    } catch (signerError: any) {
      throw new Error(`Erro ao criar assinador: ${signerError.message}`);
    }

    // 7. Assinar PDF
    console.log('✍️ Executando assinatura criptográfica...');
    let signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);
    console.log('✅ PDF assinado com sucesso:', signedPdf.length, 'bytes');

    // 8. Adicionar marca visual visual de confirmação (opcional, após assinatura)
    console.log('📝 Adicionando marca visual...');
    const { PDFDocument, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(signedPdf);
    const pages = pdfDoc.getPages();

    if (pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      const margin = 20;
      const x = margin;
      const y = margin;
      const fontSize = 7;
      const lineHeight = 9;

      const lines = [
        'DOCUMENTO ASSINADO DIGITALMENTE',
        `Por: ${signerInfo.signerName.substring(0, 40)}`,
        ...(signerInfo.cnpj ? [`CNPJ: ${signerInfo.cnpj}`] : []),
        `Data: ${formatDateTime(signerInfo.signedAt)}`,
        'Verifique em: validar.iti.gov.br'
      ].filter(l => l);

      let currentY = y + 50;
      for (const line of lines) {
        lastPage.drawText(line, {
          x: x,
          y: currentY,
          size: fontSize,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentY -= lineHeight;
      }
    }

    console.log('💾 Salvando PDF com marca visual...');
    const finalPdf = await pdfDoc.save();
    signedPdf = Buffer.from(finalPdf);

    console.log('✅ PDF assinado e finalizado:', signedPdf.length, 'bytes');
    
    return {
      success: true,
      signedPdfBuffer: signedPdf
    };
  } catch (error: any) {
    console.error('❌ Erro ao assinar PDF:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return {
      success: false,
      error: `Erro ao assinar PDF: ${error.message}`
    };
  }
}

// Gerar código único para verificação de assinatura
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
