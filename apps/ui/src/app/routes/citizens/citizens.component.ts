import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-citizens',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './citizens.component.html',
  styleUrl: './citizens.component.scss',
})
export class CitizensComponent {
  services = signal([
    {
      title: 'Animal Control',
      description: 'Information about animal control services, licensing, and regulations',
      icon: 'pi pi-shield',
      link: '/citizens/animal-control',
    },
    {
      title: 'Dog Licensing',
      description: 'License your dog and learn about pet regulations in Wellsville',
      icon: 'pi pi-id-card',
      link: '/citizens/dog-licensing',
    },
    {
      title: 'Library Services',
      description: 'Access library resources, hours, and upcoming events',
      icon: 'pi pi-book',
      link: '/citizens/library',
    },
    {
      title: 'City Newsletter',
      description: 'Subscribe to our monthly newsletter for city updates',
      icon: 'pi pi-envelope',
      link: '/citizens/newsletter',
    },
    {
      title: 'Snow Removal & Winter Parking',
      description: 'Winter parking regulations and snow removal schedules',
      icon: 'pi pi-cloud',
      link: '/citizens/snow-removal',
    },
    {
      title: 'Utilities',
      description: 'Pay bills, report issues, and manage utility services',
      icon: 'pi pi-dollar',
      link: '/citizens/utilities',
    },
  ]);
}
