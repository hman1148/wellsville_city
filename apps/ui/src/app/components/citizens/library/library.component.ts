import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, ButtonModule],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  // Library information
  libraryName = 'Hyrum City Library';
  address = '50 West Main';
  city = 'Hyrum';
  state = 'UT';
  zipCode = '84319';
  phone = '435-245-6411';
  hours = 'M-F 10-7, Sat. 10-3';
  websiteUrl = 'http://www.hyrumcity.gov/library';
  onlineLibraryUrl = 'https://utahsonlinelibrary.org/';
  imagePath = '/library.png';

  get fullAddress(): string {
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`;
  }

  onVisitWebsite(): void {
    window.open(this.websiteUrl, 'http://www.hyrumcity.gov/library');
  }

  onVisitOnlineLibrary(): void {
    window.open(this.onlineLibraryUrl, 'https://utahsonlinelibrary.org/');
  }
}
