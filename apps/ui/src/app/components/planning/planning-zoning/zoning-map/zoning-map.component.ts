import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-zoning-map',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './zoning-map.component.html',
  styleUrl: './zoning-map.component.scss',
})
export class ZoningMapComponent {}
