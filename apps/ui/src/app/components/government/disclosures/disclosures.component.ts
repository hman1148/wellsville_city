import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
} from '../../../models';
import { patchState, signalState } from '@ngrx/signals';
import { initialDisclousreComponentState } from './disclosures.state';

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
  readonly state = signalState(initialDisclousreComponentState());
  readonly disclosuresStore = inject(GovernmentDisclosuresStore);

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

    const search = this.state.searchText().toLowerCase();
    if (search) {
      items = items.filter(
        (d) =>
          d.title.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search) ||
          d.category.toLowerCase().includes(search) ||
          d.fileName.toLowerCase().includes(search)
      );
    }

    const category = this.state.selectedCategory();
    if (category) {
      items = items.filter((d) => d.category === category);
    }

    const year = this.state.selectedYear();
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

    patchState(this.state, {
      availabileYears: years.map(year => ({
        label: year.toString(),
        value: year
      }))
    });
  }

  onCategoryChange(category: string): void {
    patchState(this.state, {
      selectedCategory: category
    });
  }

  onYearChange(year: number | null): void {
    patchState(this.state, {
      selectedYear: year,
    })
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    patchState(this.state, {
      searchText: value
    });
  }

  onClearFilters(): void {
    patchState(this.state, {
      searchText: '',
      selectedCategory: undefined,
      selectedYear: null,
    });
  }

  onDownload(disclosure: GovernmentDisclosure): void {
    // Use the store to handle the download
    this.disclosuresStore.downloadDisclosure(disclosure);
  }

  getCategoryLabel(category: string): string {
    const cat = this.state.disclosureCategories().find((c) => c.value === category);
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
