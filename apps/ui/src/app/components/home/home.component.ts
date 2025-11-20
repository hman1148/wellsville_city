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
      title: 'Welcome to Wellsville',
      description: 'A beautiful community in Cache Valley',
      altText: 'Wellsville panoramic view',
    },
    {
      id: '2',
      imageUrl: '/JennCraw-Barn-1-1500x630.jpg',
      title: 'Historic Landmarks',
      description: 'Preserving our heritage and community character',
      altText: 'Historic barn in Wellsville',
    },
    {
      id: '3',
      imageUrl: '/Wellsville-Resevoir-2-1500x630.jpg',
      title: 'Natural Resources',
      description: 'Wellsville Reservoir and surrounding beauty',
      altText: 'Wellsville Reservoir',
    },
    {
      id: '4',
      imageUrl: '/FoundersDayRun-1500x630.jpg',
      title: 'Community Events',
      description: 'Join us for Founders Day and local celebrations',
      altText: 'Founders Day Run event',
    },
    {
      id: '5',
      imageUrl: '/Fisherman-1500x630.jpg',
      title: 'Recreation & Outdoor Activities',
      description: 'Enjoy fishing and outdoor adventures',
      altText: 'Fishing in Wellsville',
    },
    {
      id: '6',
      imageUrl: '/Turtle-1500x630.jpg',
      title: 'Wildlife & Nature',
      description: 'Experience the local wildlife and natural habitat',
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

  viewAnnouncement(announcement: Announcement) {
    this.selectedAnnouncement.set(announcement);
    this.displayAnnouncementDialog.set(true);
  }

  closeAnnouncementDialog() {
    this.displayAnnouncementDialog.set(false);
    this.selectedAnnouncement.set(null);
  }
}
