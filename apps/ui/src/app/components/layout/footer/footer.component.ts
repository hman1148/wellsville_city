import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, DividerModule, ButtonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { icon: 'pi pi-facebook', url: '#', label: 'Facebook' },
    { icon: 'pi pi-twitter', url: '#', label: 'Twitter' },
    { icon: 'pi pi-instagram', url: '#', label: 'Instagram' },
  ];

  quickLinks = [
    { label: 'Contact Us', url: '/information' },
    { label: 'City Council', url: '/government' },
    { label: 'Job Opportunities', url: '/information' },
    { label: 'Accessibility', url: '/information' },
  ];
}
