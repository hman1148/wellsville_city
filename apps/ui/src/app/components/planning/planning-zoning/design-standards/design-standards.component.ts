import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-design-standards',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './design-standards.component.html',
  styleUrl: './design-standards.component.scss',
})
export class DesignStandardsComponent {}
