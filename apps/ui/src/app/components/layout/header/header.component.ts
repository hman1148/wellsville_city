import { Component, HostListener, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

import { ReportsStore } from '../../../stores/reports/reports.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule, BadgeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private readonly reportsStore = inject(ReportsStore);

  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  newReportsCount = this.reportsStore.newReportsCount;

  menuItems = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/home',
    },
    {
      label: 'Citizens',
      icon: 'pi pi-users',
      routerLink: '/citizens',
    },
    {
      label: 'Government',
      icon: 'pi pi-building',
      routerLink: '/government',
    },
    {
      label: 'Departments',
      icon: 'pi pi-briefcase',
      routerLink: '/departments',
    },
    {
      label: 'Information',
      icon: 'pi pi-info-circle',
      routerLink: '/information',
    },
  ];

  ngOnInit(): void {
    // Load reports to get the count for the badge
    this.reportsStore.loadReports();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(scrollPosition > 50);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
