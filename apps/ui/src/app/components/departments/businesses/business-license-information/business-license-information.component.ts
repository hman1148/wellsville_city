import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import {
  initialBusinessLicenseInformationComponentState,
  FAQItem,
} from './business-license-information.component.state';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-business-license-information',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    RouterLink,
  ],
  styleUrl: './business-license-information.component.scss',
  templateUrl: './business-license-information.component.html',
})
export class BusinessLicenseInformationComponent {
  readonly state = signalState(
    initialBusinessLicenseInformationComponentState()
  );

  readonly displayedFaqs = computed(() => {
    const faqs = this.state.faqs();
    return this.state.showAllFaqs() ? faqs : faqs.slice(0, 6);
  });

  readonly hasMoreFaqs = computed(() => {
    return this.state.faqs().length > 6;
  });

  toggleShowAllFaqs(): void {
    patchState(this.state, (state) => ({
      showAllFaqs: !state.showAllFaqs,
    }));
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      general: 'General',
      application: 'Application',
      renewal: 'Renewal',
      'home-business': 'Home Business',
    };
    return labels[category] || category;
  }

  getCategorySeverity(
    category: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
    > = {
      general: 'info',
      application: 'success',
      renewal: 'warn',
      'home-business': 'secondary',
    };
    return severities[category] || 'secondary';
  }

  getFaqsByCategory(category: string): FAQItem[] {
    return this.state.faqs().filter((faq) => faq.category === category);
  }
}
