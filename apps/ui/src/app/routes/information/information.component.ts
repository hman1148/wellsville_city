import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.scss',
})
export class InformationComponent {
  infoSections = signal([
    {
      title: 'City Activities & Events',
      description: 'Calendar of upcoming community events and activities',
      icon: 'pi pi-calendar',
      link: '/information/activities',
    },
    {
      title: 'Boards & Committees',
      description: 'Learn about city boards, committees, and how to get involved',
      icon: 'pi pi-users',
      link: '/information/boards-committees',
    },
    {
      title: 'City History',
      description: 'Explore the rich history and heritage of Wellsville',
      icon: 'pi pi-clock',
      link: '/information/history',
    },
    {
      title: 'Community Center',
      description: 'Community center facilities, rentals, and programs',
      icon: 'pi pi-home',
      link: '/information/community-center',
    },
    {
      title: 'Contact Information',
      description: 'City office hours, addresses, and phone numbers',
      icon: 'pi pi-phone',
      link: '/information/contact',
    },
    {
      title: 'Employment Opportunities',
      description: 'Current job openings and career opportunities with the city',
      icon: 'pi pi-briefcase',
      link: '/information/employment',
    },
  ]);
}
