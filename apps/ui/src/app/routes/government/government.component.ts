import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-government',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, AvatarModule],
  templateUrl: './government.component.html',
  styleUrl: './government.component.scss',
})
export class GovernmentComponent {
  sections = signal([
    {
      title: 'Mayor',
      description: 'Meet the Mayor and learn about the executive leadership of Wellsville',
      icon: 'pi pi-user',
      link: '/government/mayor',
    },
    {
      title: 'City Council',
      description: 'View council members, meeting schedules, and agendas',
      icon: 'pi pi-users',
      link: '/government/city-council',
    },
    {
      title: 'Planning and Zoning',
      description: 'Information about zoning regulations, permits, and development',
      icon: 'pi pi-map',
      link: '/government/planning-zoning',
    },
    {
      title: 'City Ordinances',
      description: 'Browse city laws, regulations, and municipal code',
      icon: 'pi pi-book',
      link: '/government/ordinances',
    },
    {
      title: 'Meeting Minutes',
      description: 'Access archived meeting minutes and official records',
      icon: 'pi pi-file',
      link: '/government/minutes',
    },
    {
      title: 'Public Notices',
      description: 'View current public notices and legal announcements',
      icon: 'pi pi-megaphone',
      link: '/government/notices',
    },
  ]);
}
