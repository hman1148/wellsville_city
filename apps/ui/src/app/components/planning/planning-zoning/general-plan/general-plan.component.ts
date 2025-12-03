import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-general-plan',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './general-plan.component.html',
  styleUrl: './general-plan.component.scss',
})
export class GeneralPlanComponent {}
