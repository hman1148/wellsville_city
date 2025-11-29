import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

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
    DialogModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedAnnouncement = signal<Announcement | null>(null);
  displayAnnouncementDialog = signal(false);
  carouselSlides = signal<CarouselSlide[]>([
    {
      id: '1',
      imageUrl: '/Wellsvilles-HDR-Pano-1-1500x630.jpg',
      title: 'Welcome Home',
      description: 'Where Cache Valley beauty meets modern living',
      altText: 'Wellsville panoramic view',
    },
    {
      id: '2',
      imageUrl: '/JennCraw-Barn-1-1500x630.jpg',
      title: 'Rich in History',
      description: 'Honoring our past while building the future',
      altText: 'Historic barn in Wellsville',
    },
    {
      id: '3',
      imageUrl: '/Wellsville-Resevoir-2-1500x630.jpg',
      title: 'Nature at Your Doorstep',
      description: 'Crystal waters and mountain views year-round',
      altText: 'Wellsville Reservoir',
    },
    {
      id: '4',
      imageUrl: '/FoundersDayRun-1500x630.jpg',
      title: 'Community First',
      description: 'Celebrating together, growing together',
      altText: 'Founders Day Run event',
    },
    {
      id: '5',
      imageUrl: '/Fisherman-1500x630.jpg',
      title: 'Adventure Awaits',
      description: 'Your backyard is our playground',
      altText: 'Fishing in Wellsville',
    },
    {
      id: '6',
      imageUrl: '/Turtle-1500x630.jpg',
      title: 'Living Ecosystems',
      description: 'Where wildlife and community thrive in harmony',
      altText: 'Local wildlife',
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
      description: 'Pay water, sewer, and garbage bills online',
      route: '/citizens',
      severity: 'success' as const,
    },
    {
      icon: 'pi pi-calendar',
      label: 'Events & Meetings',
      description: 'Stay up to date with community happenings',
      route: '/information',
      severity: 'info' as const,
    },
    {
      icon: 'pi pi-building',
      label: 'City Council',
      description: 'Connect with your elected representatives',
      route: '/government',
      severity: 'warn' as const,
    },
    {
      icon: 'pi pi-phone',
      label: 'Contact',
      description: 'Reach city departments and staff',
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

  viewAnnouncement(announcement: Announcement) {
    this.selectedAnnouncement.set(announcement);
    this.displayAnnouncementDialog.set(true);
  }

  closeAnnouncementDialog() {
    this.displayAnnouncementDialog.set(false);
    this.selectedAnnouncement.set(null);
  }
}
