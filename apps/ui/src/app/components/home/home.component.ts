import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { type CarouselSlide, type Announcement } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CarouselModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  carouselSlides = signal<CarouselSlide[]>([
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
      title: 'Welcome to Wellsville',
      description: 'A beautiful community in Cache Valley',
      altText: 'Wellsville scenic view',
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
      title: 'Community Events',
      description: 'Join us for local activities and celebrations',
      altText: 'Community gathering',
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop',
      title: 'Natural Beauty',
      description: 'Explore our parks and outdoor spaces',
      altText: 'Nature and wildlife',
    },
  ]);

  announcements = signal<Announcement[]>([
    {
      id: '1',
      title: 'Public Notice - Recreation District',
      content: 'Information regarding the recreation special service district. Community input is welcomed.',
      date: new Date().toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      title: 'State Representative Visit',
      content: 'Scheduled opportunities to meet with your state representative. Check the calendar for dates.',
      date: new Date().toISOString(),
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Newsletter Signup',
      content: 'Stay informed about city news and events by signing up for our monthly newsletter.',
      date: new Date().toISOString(),
      priority: 'low',
    },
    {
      id: '4',
      title: '2025 Election Information',
      content: 'Learn about candidates and important election dates for the upcoming city elections.',
      date: new Date().toISOString(),
      priority: 'medium',
    },
  ]);

  quickLinks = signal([
    {
      icon: 'pi pi-dollar',
      label: 'Pay Utilities',
      description: 'Convenient online utility payment portal',
      route: '/citizens',
      severity: 'success' as const,
    },
    {
      icon: 'pi pi-calendar',
      label: 'City Calendar',
      description: 'View upcoming events and meetings',
      route: '/information',
      severity: 'info' as const,
    },
    {
      icon: 'pi pi-building',
      label: 'City Council',
      description: 'Meet your city council members',
      route: '/government',
      severity: 'warn' as const,
    },
    {
      icon: 'pi pi-phone',
      label: 'Contact Us',
      description: 'Get in touch with city departments',
      route: '/information',
      severity: 'secondary' as const,
    },
  ]);

  getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }
}
