import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
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
}
