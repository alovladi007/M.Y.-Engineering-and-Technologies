import { Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class FormsService {
  constructor(private pdfService: PdfService) {}

  async generateADS(matterId: string, data: any) {
    return this.pdfService.generateADS(data);
  }

  async generateIDS(matterId: string, data: any) {
    return this.pdfService.generateIDS(data);
  }
}