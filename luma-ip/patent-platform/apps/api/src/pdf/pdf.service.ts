import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfService {
  async generateADS(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Application Data Sheet (ADS)', {
      x: 50,
      y: 750,
      size: 20,
      font,
    });

    page.drawText(`Title: ${data.title || 'Patent Application'}`, {
      x: 50,
      y: 700,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateIDS(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Information Disclosure Statement (IDS)', {
      x: 50,
      y: 750,
      size: 20,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}