import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { Ordinance, OrdinanceCategory, ORDINANCE_CATEGORIES } from '../../../models';
import { initialOrdinancesState } from './ordinances.state';

@Component({
  selector: 'app-ordinances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    AccordionModule,
    ChipModule,
    DividerModule,
    AutoCompleteModule,
  ],
  templateUrl: './ordinances.component.html',
  styleUrl: './ordinances.component.scss',
})
export class OrdinancesComponent {
  readonly state = signalState(initialOrdinancesState());
  readonly categories = ORDINANCE_CATEGORIES;

  readonly filteredOrdinances = computed(() => {
    let filtered = this.state.ordinances();
    const query = this.state.searchQuery().toLowerCase().trim();
    const category = this.state.selectedCategory();

    // Filter by category
    if (category) {
      filtered = filtered.filter((ord) => ord.category === category);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (ord) =>
          ord.title.toLowerCase().includes(query) ||
          ord.chapter.toLowerCase().includes(query) ||
          ord.description.toLowerCase().includes(query) ||
          ord.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  readonly ordinancesByCategory = computed(() => {
    const filtered = this.filteredOrdinances();
    const grouped = new Map<OrdinanceCategory, Ordinance[]>();

    filtered.forEach((ord) => {
      const existing = grouped.get(ord.category) || [];
      grouped.set(ord.category, [...existing, ord]);
    });

    return grouped;
  });

  readonly categoryCounts = computed(() => {
    const counts = new Map<OrdinanceCategory, number>();
    this.state.ordinances().forEach((ord) => {
      counts.set(ord.category, (counts.get(ord.category) || 0) + 1);
    });
    return counts;
  });

  onSearchChange(query: string): void {
    patchState(this.state, { searchQuery: query });

    if (query.length >= 2) {
      const suggestions = new Set<string>();
      const lowerQuery = query.toLowerCase();

      this.state.ordinances().forEach((ord) => {
        if (ord.title.toLowerCase().includes(lowerQuery)) {
          suggestions.add(ord.title);
        }
        ord.keywords.forEach((keyword) => {
          if (keyword.toLowerCase().includes(lowerQuery)) {
            suggestions.add(keyword);
          }
        });
      });

      patchState(this.state, { searchSuggestions: Array.from(suggestions).slice(0, 5) });
    } else {
      patchState(this.state, { searchSuggestions: [] });
    }
  }

  onCategorySelect(category: OrdinanceCategory | null): void {
    patchState(this.state, { selectedCategory: category });
  }

  onClearFilters(): void {
    patchState(this.state, { searchQuery: '', selectedCategory: null, searchSuggestions: [] });
  }

  onViewOrdinance(ordinance: Ordinance): void {
    if (ordinance.pdfUrl) {
      window.open(ordinance.pdfUrl, '_blank');
    } else if (ordinance.externalUrl) {
      window.open(ordinance.externalUrl, '_blank');
    }
  }

  onViewAllOrdinancesOnline(): void {
    window.open('https://codelibrary.amlegal.com/codes/wellsvilleut/latest/overview', '_blank');
  }

  getCategoryInfo(categoryId: OrdinanceCategory) {
    return this.categories.find((cat) => cat.id === categoryId);
  }

  getCategoryCount(categoryId: OrdinanceCategory): number {
    return this.categoryCounts().get(categoryId) || 0;
  }
}
