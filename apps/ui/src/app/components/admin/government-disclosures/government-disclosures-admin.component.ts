import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';

import { GovernmentDisclosuresStore } from '../../../stores';
import {
  GovernmentDisclosure,
  disclosureCategories,
} from '../../../models';
import { GovernmentDisclosuresService } from '../../../services/government-disclosures.service';

@Component({
  selector: 'app-government-disclosures-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    Textarea,
    Select,
    InputNumberModule,
    FileUploadModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressBarModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './government-disclosures-admin.component.html',
  styleUrl: './government-disclosures-admin.component.scss',
})
export class GovernmentDisclosuresAdminComponent implements OnInit {
  readonly disclosuresStore = inject(GovernmentDisclosuresStore);
  readonly disclosuresService = inject(GovernmentDisclosuresService);
  readonly messageService = inject(MessageService);
  readonly confirmationService = inject(ConfirmationService);
  readonly fb = inject(FormBuilder);

  displayUploadDialog = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  selectedFile = signal<File | null>(null);

  uploadForm: FormGroup;
  categories = disclosureCategories;

  ngOnInit(): void {
    this.disclosuresStore.resolveDisclosures();
    this.initForm();
  }

  initForm(): void {
    const currentYear = new Date().getFullYear();
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
    });
  }

  get disclosures() {
    return this.disclosuresStore.governmentDisclosuresEntities;
  }

  get isLoading() {
    return this.disclosuresStore.isLoading;
  }

  onShowUploadDialog(): void {
    this.displayUploadDialog.set(true);
    this.uploadForm.reset({
      year: new Date().getFullYear(),
    });
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
  }

  onCloseUploadDialog(): void {
    this.displayUploadDialog.set(false);
    this.uploadForm.reset();
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
  }

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      this.selectedFile.set(file);
    }
  }

  async onUploadDocument(): Promise<void> {
    if (this.uploadForm.invalid || !this.selectedFile()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields and select a file',
      });
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    try {
      const file = this.selectedFile()!;
      const formValues = this.uploadForm.value;

      this.uploadProgress.set(25);

      const { url, key } = await firstValueFrom(
        this.disclosuresService.getUploadPresignedUrl(file.name, file.type)
      );

      this.uploadProgress.set(50);

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      this.uploadProgress.set(75);

      const disclosure = {
        title: formValues.title,
        description: formValues.description,
        category: formValues.category,
        year: formValues.year,
        fileUrl: key,
        fileName: file.name,
        fileSize: file.size,
      };

      await firstValueFrom(
        this.disclosuresService.uploadDisclosure(disclosure)
      );

      this.uploadProgress.set(100);

      this.messageService.add({
        severity: 'success',
        summary: 'Upload Successful',
        detail: 'Document uploaded successfully',
      });

      await this.disclosuresStore.refreshDisclosures();
      this.onCloseUploadDialog();
    } catch (error) {
      console.error('Error uploading document:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Failed to upload document. Please try again.',
      });
    } finally {
      this.isUploading.set(false);
    }
  }

  onDeleteDisclosure(disclosure: GovernmentDisclosure): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${disclosure.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await firstValueFrom(
            this.disclosuresService.deleteDisclosure(disclosure.id)
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Document deleted successfully',
          });

          await this.disclosuresStore.refreshDisclosures();
        } catch (error) {
          console.error('Error deleting document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: 'Failed to delete document. Please try again.',
          });
        }
      },
    });
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
