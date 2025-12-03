import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PlanningZoningStore } from '../../../stores';

@Component({
  selector: 'app-planning-zoning',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './planning-zoning.component.html',
  styleUrl: './planning-zoning.component.scss',
})
export class PlanningZoningComponent {
  readonly planningZoningStore = inject(PlanningZoningStore);

  get sections() {
    return this.planningZoningStore.sections();
  }
}
