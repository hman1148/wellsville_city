import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';

import { MeetingsStore } from '../../../stores';
import { Meeting, MeetingFile, MeetingType } from '../../../models';
import { MeetingsService } from '../../../services/meetings.service';

type MeetingDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-meetings-admin',
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
    FileUploadModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressBarModule,
    CalendarModule,
    DividerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './meetings-admin.component.html',
  styleUrl: './meetings-admin.component.scss',
})
export class MeetingsAdminComponent implements OnInit {
  readonly meetingsStore = inject(MeetingsStore);
  readonly meetingsService = inject(MeetingsService);
  readonly messageService = inject(MessageService);
  readonly confirmationService = inject(ConfirmationService);
  readonly fb = inject(FormBuilder);

  displayDialog = signal(false);
  dialogMode = signal<MeetingDialogMode>('create');
  isSubmitting = signal(false);
  selectedMeetingId = signal<string | null>(null);

  meetingForm: FormGroup;

  meetingTypes: { label: string; value: MeetingType }[] = [
    { label: 'City Council', value: 'city-council' },
    { label: 'Planning & Zoning', value: 'planning-zoning' },
  ];

  meetingStatuses = [
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Past', value: 'past' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  fileCategories = [
    { label: 'Agenda', value: 'agenda' },
    { label: 'Minutes', value: 'minutes' },
    { label: 'Discussion Topics', value: 'discussion' },
    { label: 'Attachment', value: 'attachment' },
    { label: 'Other', value: 'other' },
  ];

  ngOnInit(): void {
    this.meetingsStore.resolveMeetings();
    this.initForm();
  }

  initForm(): void {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      meetingDate: [new Date(), Validators.required],
      meetingTime: ['', Validators.required],
      location: ['', Validators.required],
      meetingType: ['city-council', Validators.required],
      status: ['upcoming', Validators.required],
      files: this.fb.array([]),
    });
  }

  get meetings() {
    return this.meetingsStore.meetings();
  }

  get isLoading() {
    return this.meetingsStore.isLoading();
  }

  get filesFormArray(): FormArray {
    return this.meetingForm.get('files') as FormArray;
  }

  onShowCreateDialog(): void {
    this.dialogMode.set('create');
    this.selectedMeetingId.set(null);
    this.displayDialog.set(true);
    this.meetingForm.reset({
      meetingDate: new Date(),
      meetingType: 'city-council',
      status: 'upcoming',
    });
    this.filesFormArray.clear();
  }

  onShowEditDialog(meeting: Meeting): void {
    this.dialogMode.set('edit');
    this.selectedMeetingId.set(meeting.id);
    this.displayDialog.set(true);

    // Convert ISO date string to Date object for calendar
    const meetingDate = new Date(meeting.meetingDate);

    this.meetingForm.patchValue({
      title: meeting.title,
      description: meeting.description,
      meetingDate: meetingDate,
      meetingTime: meeting.meetingTime,
      location: meeting.location,
      meetingType: meeting.meetingType,
      status: meeting.status,
    });

    // Load existing files
    this.filesFormArray.clear();
    meeting.files.forEach((file) => {
      this.filesFormArray.push(
        this.fb.group({
          id: [file.id],
          title: [file.title, Validators.required],
          description: [file.description],
          category: [file.category, Validators.required],
          s3Key: [file.s3Key],
          s3Url: [file.s3Url],
          fileType: [file.fileType],
          fileSize: [file.fileSize],
        })
      );
    });
  }

  onCloseDialog(): void {
    this.displayDialog.set(false);
    this.isSubmitting.set(false);
    this.meetingForm.reset();
    this.filesFormArray.clear();
  }

  onAddFile(): void {
    this.filesFormArray.push(
      this.fb.group({
        id: [''],
        title: ['', Validators.required],
        description: [''],
        category: ['other', Validators.required],
        s3Key: [''],
        s3Url: [''],
        fileType: ['pdf'],
        fileSize: [null],
        file: [null],
      })
    );
  }

  onRemoveFile(index: number): void {
    this.filesFormArray.removeAt(index);
  }

  async onFileSelect(event: any, index: number): Promise<void> {
    const file = event.files[0];
    if (!file) return;

    const fileGroup = this.filesFormArray.at(index) as FormGroup;
    fileGroup.patchValue({
      file: file,
      fileSize: file.size,
      fileType: file.name.split('.').pop()?.toLowerCase() || 'pdf',
    });

    // Set default title if empty
    if (!fileGroup.get('title')?.value) {
      fileGroup.patchValue({
        title: file.name.replace(/\.[^/.]+$/, ''),
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.meetingForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.meetingForm.value;

      // Convert Date object to ISO string
      const meetingDate = new Date(formValue.meetingDate);
      const isoDate = meetingDate.toISOString().split('T')[0];

      // Upload files and get S3 URLs
      const uploadedFiles: MeetingFile[] = [];
      for (const fileGroup of this.filesFormArray.controls) {
        const fileValue = fileGroup.value;
        const file = fileValue.file;

        if (file) {
          // Get upload URL from backend
          const uploadUrlResponse = await firstValueFrom(
            this.meetingsService.getUploadUrl(file.name, file.type)
          );

          if (uploadUrlResponse.success) {
            // Upload file to S3
            await fetch(uploadUrlResponse.url, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            uploadedFiles.push({
              id: fileValue.id || crypto.randomUUID(),
              title: fileValue.title,
              description: fileValue.description,
              category: fileValue.category,
              s3Key: uploadUrlResponse.key,
              s3Url: uploadUrlResponse.url.split('?')[0],
              fileType: fileValue.fileType,
              fileSize: fileValue.fileSize,
            });
          }
        } else if (fileValue.s3Key) {
          // Existing file, keep it
          uploadedFiles.push({
            id: fileValue.id,
            title: fileValue.title,
            description: fileValue.description,
            category: fileValue.category,
            s3Key: fileValue.s3Key,
            s3Url: fileValue.s3Url,
            fileType: fileValue.fileType,
            fileSize: fileValue.fileSize,
          });
        }
      }

      const meetingData: Meeting = {
        id: this.selectedMeetingId() || crypto.randomUUID(),
        title: formValue.title,
        description: formValue.description,
        meetingDate: isoDate,
        meetingTime: formValue.meetingTime,
        location: formValue.location,
        meetingType: formValue.meetingType,
        status: formValue.status,
        files: uploadedFiles,
      };

      if (this.dialogMode() === 'create') {
        await firstValueFrom(this.meetingsService.createMeeting(meetingData));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Meeting created successfully',
        });
      } else {
        await firstValueFrom(
          this.meetingsService.updateMeeting(meetingData.id, meetingData)
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Meeting updated successfully',
        });
      }

      // Refresh meetings list
      await this.meetingsStore.refreshMeetings();

      this.onCloseDialog();
    } catch (error) {
      console.error('Error saving meeting:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save meeting. Please try again.',
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onDelete(meeting: Meeting): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${meeting.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await firstValueFrom(this.meetingsService.deleteMeeting(meeting.id));
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Meeting deleted successfully',
          });
          await this.meetingsStore.refreshMeetings();
        } catch (error) {
          console.error('Error deleting meeting:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete meeting',
          });
        }
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getMeetingTypeLabel(type: MeetingType): string {
    const found = this.meetingTypes.find((t) => t.value === type);
    return found?.label || type;
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
    > = {
      upcoming: 'success',
      past: 'secondary',
      cancelled: 'warn',
    };
    return severities[status] || 'secondary';
  }
}
