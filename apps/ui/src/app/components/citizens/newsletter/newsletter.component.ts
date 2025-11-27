import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { NewsletterStore } from '../../../stores';
import { Newsletter } from '../../../models';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    ButtonModule,
    DialogModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.scss',
})
export class NewsletterComponent implements OnInit {
  readonly newsletterStore = inject(NewsletterStore);

  showPreviewDialog = false;

  ngOnInit(): void {
    this.newsletterStore.resolveNewsletters();
  }

  get newsletters() {
    return this.newsletterStore.newsletters();
  }

  get isLoading() {
    return this.newsletterStore.isLoading();
  }

  get selectedNewsletter() {
    return this.newsletterStore.selectedNewsletter();
  }

  get previewUrl() {
    return this.newsletterStore.previewUrl();
  }

  onDownloadNewsletter(newsletter: Newsletter): void {
    // Open the S3 URL in a new tab to download
    window.open(newsletter.s3Url, '_blank');
  }

  async onViewNewsletter(newsletter: Newsletter): Promise<void> {
    this.newsletterStore.selectNewsletter(newsletter);
    await this.newsletterStore.setPreviewUrl(newsletter.s3Url);
    this.showPreviewDialog = true;
  }

  onClosePreview(): void {
    this.showPreviewDialog = false;
    this.newsletterStore.clearPreviewUrl();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    return `${kb.toFixed(2)} KB`;
  }
}
