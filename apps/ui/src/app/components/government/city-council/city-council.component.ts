import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { CouncilMember } from '../../../models';
import { CityCouncilStore } from '../../../stores/city-council/city-council.store';

@Component({
  selector: 'app-city-council',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule],
  templateUrl: './city-council.component.html',
  styleUrl: './city-council.component.scss',
})
export class CityCouncilComponent {
  readonly router = inject(Router);
  readonly cityCouncilStore = inject(CityCouncilStore);

  onContactMember(member: CouncilMember): void {
    this.cityCouncilStore.selectMember(member);
    this.router.navigate(['/government/city-council/contact']);
  }
}
