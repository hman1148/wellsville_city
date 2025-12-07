import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signalState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { initialCemeteryComponentState } from './cemetery.component.state';

@Component({
  selector: 'app-cemetery',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, ButtonModule],
  templateUrl: './cemetery.component.html',
  styleUrl: './cemetery.component.scss',
})
export class CemeteryComponent {
  readonly state = signalState(initialCemeteryComponentState());

  openFeesPage(): void {
    window.open('https://www.wellsvillecity.com/fee-schedule', '_blank');
  }

  openNamesInStone(): void {
    window.open('https://www.namesinstone.com', '_blank');
  }

  openUSGenWeb(): void {
    window.open('https://www.usgwarchives.net', '_blank');
  }

  openVeteransList(): void {
    window.open('https://www.wellsvillecity.com/veterans-list', '_blank');
  }
}
