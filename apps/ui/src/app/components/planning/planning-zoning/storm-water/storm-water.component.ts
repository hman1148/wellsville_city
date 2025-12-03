import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-storm-water',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './storm-water.component.html',
  styleUrl: './storm-water.component.scss',
})
export class StormWaterComponent {}
