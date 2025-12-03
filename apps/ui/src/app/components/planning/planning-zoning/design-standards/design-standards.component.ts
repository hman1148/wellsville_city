import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';

type DocumentInfo = {
  title: string;
  description: string;
  url: string;
  fileName: string;
  fileSize: string;
  lastUpdated: string;
};

type ZoningMapInfo = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

@Component({
  selector: 'app-design-standards',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    ImageModule,
    DialogModule,
  ],
  templateUrl: './design-standards.component.html',
  styleUrl: './design-standards.component.scss',
})
export class DesignStandardsComponent {
  // Signal state for PDF viewer dialog
  showPdfViewer = signal(false);

  // Signal state for zoning map dialog
  showZoningMapDialog = signal(false);

  // Document information
  designStandardsDoc = signal<DocumentInfo>({
    title: 'Design Standards and Specifications',
    description:
      'Jones & Associates Consulting Engineers work with Wellsville City to establish our construction standards. View the latest design standards and specifications.',
    url: '/Zoning/Wellsville_Public_Works_Standards_2012-02.pdf',
    fileName: 'Wellsville_Public_Works_Standards_2012-02.pdf',
    fileSize: '12.4 MB',
    lastUpdated: '2012',
  });

  // Zoning map information
  zoningMap = signal<ZoningMapInfo>({
    title: 'Wellsville City Zoning Map',
    description:
      'View the current zoning map of Wellsville City. Click to view the full-size map or download it for your reference.',
    imageUrl: '/Zoning/wellsvilezoning.png',
    imageAlt: 'Wellsville City Zoning Map',
  });

  // Computed property for PDF viewer URL
  pdfViewerUrl = computed(() => this.designStandardsDoc().url);

  // Methods to control dialogs
  openPdfViewer(): void {
    this.showPdfViewer.set(true);
  }

  closePdfViewer(): void {
    this.showPdfViewer.set(false);
  }

  openZoningMap(): void {
    this.showZoningMapDialog.set(true);
  }

  closeZoningMap(): void {
    this.showZoningMapDialog.set(false);
  }

  // Method to download PDF
  downloadPdf(): void {
    const link = document.createElement('a');
    link.href = this.designStandardsDoc().url;
    link.download = this.designStandardsDoc().fileName;
    link.click();
  }

  // Method to download zoning map
  downloadZoningMap(): void {
    const link = document.createElement('a');
    link.href = this.zoningMap().imageUrl;
    link.download = 'wellsville-zoning-map.png';
    link.click();
  }
}
