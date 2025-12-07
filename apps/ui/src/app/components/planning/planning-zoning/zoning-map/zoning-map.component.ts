import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { patchState, signalState } from '@ngrx/signals';
import { initialZoningMapComponentState } from './zoning-map.component.state';

@Component({
  selector: 'app-zoning-map',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    ImageModule,
    DialogModule,
  ],
  templateUrl: './zoning-map.component.html',
  styleUrl: './zoning-map.component.scss',
})
export class ZoningMapComponent {
  readonly state = signalState(initialZoningMapComponentState());
  readonly pdfViewerUrl = computed(() => this.state.publicWorksStandards().url);

  openZoningMap(): void {
    patchState(this.state, { showZoningMapDialog: true });
  }

  closeZoningMap(): void {
    patchState(this.state, { showZoningMapDialog: false });
  }

  openPdfViewer(): void {
    patchState(this.state, { showPdfViewer: true });
  }

  closePdfViewer(): void {
    patchState(this.state, { showPdfViewer: false });
  }

  downloadZoningMap(): void {
    const link = document.createElement('a');
    link.href = this.state.zoningMap().imageUrl;
    link.download = 'wellsville-zoning-map.png';
    link.click();
  }

  downloadPdf(): void {
    const link = document.createElement('a');
    link.href = this.state.publicWorksStandards().url;
    link.download = this.state.publicWorksStandards().fileName;
    link.click();
  }
}
