import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-animal-control',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule],
  templateUrl: './animal-control.component.html',
  styleUrl: './animal-control.component.scss',
})
export class AnimalControlComponent {
  animalControlPhone = '435-512-6658';
  humaineSocietyPhone = '435-792-3920';
}
