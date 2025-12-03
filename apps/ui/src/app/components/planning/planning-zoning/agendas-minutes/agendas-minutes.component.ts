import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-agendas-minutes',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './agendas-minutes.component.html',
  styleUrl: './agendas-minutes.component.scss',
})
export class AgendasMinutesComponent {}
