import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-land-use-regulations',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './land-use-regulations.component.html',
  styleUrl: './land-use-regulations.component.scss',
})
export class LandUseRegulationsComponent {}
