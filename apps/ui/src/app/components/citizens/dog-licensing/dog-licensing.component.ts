import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dog-licensing',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, ButtonModule],
  templateUrl: './dog-licensing.component.html',
  styleUrl: './dog-licensing.component.scss',
})
export class DogLicensingComponent {
  // Contact information
  animalControlPhone = '435-512-6658';
  cityOfficePhone = '435-245-3686';

  // Fees
  spayedNeuteredFee = 5;
  unalteredFee = 10;
  kennelPermitFee = 50;

  // Permit download path
  kennelPermitPath = '/KennelPermit.png';

  onDownloadPermit(): void {
    const link = document.createElement('a');
    link.href = this.kennelPermitPath;
    link.download = 'KennelPermit.png';
    link.click();
  }
}
