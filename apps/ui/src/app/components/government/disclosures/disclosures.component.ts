import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { GovernmentDisclosuresStore } from '../../../stores';
import {
  GovernmentDisclosure,
  disclosureCategories,
} from '../../../models';
import { GovernmentDisclosuresService } from '../../../services/government-disclosures.service';

@Component({
  selector: 'app-disclosures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    Select,
    InputTextModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './disclosures.component.html',
  styleUrl: './disclosures.component.scss',
})
export class DisclosuresComponent implements OnInit {
  readonly disclosuresStore = inject(GovernmentDisclosuresStore);
  readonly disclosuresService = inject(GovernmentDisclosuresService);

  searchText = signal<string>('');
  selectedCategory = signal<string>('');
  selectedYear = signal<number | null>(null);

  categories = disclosureCategories;
  availableYears = signal<{ label: string; value: number }[]>([]);

  ngOnInit(): void {
    this.disclosuresStore.resolveDisclosures();
    this.calculateAvailableYears();
  }

  get disclosures() {
    return this.disclosuresStore.governmentDisclosuresEntities;
  }

  get isLoading() {
    return this.disclosuresStore.isLoading;
  }

  filteredDisclosures = computed(() => {
    let items = this.disclosures();

    const search = this.searchText().toLowerCase();
    if (search) {
      items = items.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search) ||
          d.category.toLowerCase().includes(search) ||
          d.fileName.toLowerCase().includes(search)
      );
    }

    const category = this.selectedCategory();
    if (category) {
      items = items.filter((d) => d.category === category);
    }

    const year = this.selectedYear();
    if (year !== null) {
      items = items.filter((d) => d.year === year);
    }

    return items.sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
  });

  calculateAvailableYears(): void {
    const disclosures = this.disclosures();
    const years = [...new Set(disclosures.map((d) => d.year))].sort(
      (a: number, b: number) => b - a
    );
    this.availableYears.set(
      years.map((year: number) => ({ label: year.toString(), value: year }))
    );
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  onYearChange(year: number | null): void {
    this.selectedYear.set(year);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  onClearFilters(): void {
    this.searchText.set('');
    this.selectedCategory.set('');
    this.selectedYear.set(null);
  }

  async onDownload(disclosure: GovernmentDisclosure): Promise<void> {
    try {
      const { url } = await firstValueFrom(
        this.disclosuresService.getDownloadPresignedUrl(disclosure.fileUrl)
      );

      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  }

  getCategorySeverity(
    category: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (category) {
      case 'campaign-finance':
        return 'info';
      case 'conflict-of-interest':
        return 'warn';
      case 'financial-report':
        return 'success';
      case 'audit':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
