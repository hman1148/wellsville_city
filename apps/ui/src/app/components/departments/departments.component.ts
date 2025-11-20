import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
})
export class DepartmentsComponent {
  departments = signal([
    {
      title: 'Business Licensing',
      description: 'Information for local businesses, permits, and regulations',
      icon: 'pi pi-briefcase',
      link: '/departments/businesses',
    },
    {
      title: 'Cemetery Services',
      description: 'Cemetery information, plots, and memorial services',
      icon: 'pi pi-map-marker',
      link: '/departments/cemetery',
    },
    {
      title: 'Parks and Recreation',
      description: 'Parks, facilities, programs, and recreational activities',
      icon: 'pi pi-globe',
      link: '/departments/parks-recreation',
    },
    {
      title: 'Public Safety',
      description: 'Police, fire, emergency services, and safety information',
      icon: 'pi pi-shield',
      link: '/departments/public-safety',
    },
    {
      title: 'City Court',
      description: 'Court information, payment options, and legal resources',
      icon: 'pi pi-building-columns',
      link: '/departments/court',
    },
    {
      title: 'Public Works',
      description: 'Streets, water, sewer, and infrastructure maintenance',
      icon: 'pi pi-wrench',
      link: '/departments/public-works',
    },
  ]);
}
