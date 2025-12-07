import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { patchState, signalState } from '@ngrx/signals';
import { initialGeneralPlanComponentState } from './general-plan.component.state';

@Component({
  selector: 'app-general-plan',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    ImageModule,
    DialogModule,
  ],
  templateUrl: './general-plan.component.html',
  styleUrl: './general-plan.component.scss',
})
export class GeneralPlanComponent {
  readonly state = signalState(initialGeneralPlanComponentState());
  readonly pdfViewerUrl = computed(() => this.state.generalPlanDoc().url);

  openPdfViewer(): void {
    patchState(this.state, { showPdfViewer: true });
  }

  closePdfViewer(): void {
    patchState(this.state, { showPdfViewer: false });
  }

  openLandUseMap(): void {
    patchState(this.state, { showLandUseMapDialog: true });
  }

  closeLandUseMap(): void {
    patchState(this.state, { showLandUseMapDialog: false });
  }

  downloadPdf(): void {
    const link = document.createElement('a');
    link.href = this.state.generalPlanDoc().url;
    link.download = this.state.generalPlanDoc().fileName;
    link.click();
  }

  downloadLandUseMap(): void {
    const link = document.createElement('a');
    link.href = this.state.landUseMap().imageUrl;
    link.download = 'wellsville-land-use-map.png';
    link.click();
  }
}
