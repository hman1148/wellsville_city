import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-planning-commission',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './planning-commission.component.html',
  styleUrl: './planning-commission.component.scss',
})
export class PlanningCommissionComponent {}
