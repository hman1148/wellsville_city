import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RadioButton } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { initialBusinessLicenseFormState, BusinessLicenseFormData, businessLicenseStateSuite } from './business-license-form.state';
import { BusinessLicenseStore } from '../../../../../../stores';

@Component({
  selector: 'app-business-license-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    RadioButton,
    Checkbox,
    Select,
    DatePickerModule,
    FileUploadModule,
    DividerModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './business-license-form.component.html',
  styleUrl: './business-license-form.component.scss',
})
export class BusinessLicenseFormComponent {
  readonly state = signalState(initialBusinessLicenseFormState());
  readonly businessLicenseStore = inject(BusinessLicenseStore);
  readonly messageService = inject(MessageService);

  readonly locationTypeOptions = [
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
  ];

  readonly ownershipTypeOptions = [
    { label: 'Sole Owner', value: 'sole-owner' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Corporation', value: 'corporation' },
    { label: 'Other', value: 'other' },
  ];

  get formData() {
    return this.state.formData();
  }

  get showCorporationName(): boolean {
    return this.formData.ownershipType === 'corporation';
  }

  get showOwnershipOtherDescription(): boolean {
    return this.formData.ownershipType === 'other';
  }

  get vestResult() {
    return businessLicenseStateSuite(this.formData);
  }

  get isFormValid(): boolean {
    return this.vestResult.isValid();
  }

  updateField(field: keyof BusinessLicenseFormData, value: any): void {
    patchState(this.state, {
      formData: {
        ...this.formData,
        [field]: value,
      },
      fieldTouched: {
        ...this.state.fieldTouched(),
        [field]: true,
      },
    });
  }

  markFieldAsTouched(field: keyof BusinessLicenseFormData): void {
    patchState(this.state, {
      fieldTouched: {
        ...this.state.fieldTouched(),
        [field]: true,
      },
    });
  }

  hasError(field: keyof BusinessLicenseFormData): boolean {
    const touched = this.state.fieldTouched()[field];
    return touched && this.vestResult.hasErrors(field);
  }

  getErrorMessage(field: keyof BusinessLicenseFormData): string {
    const errors = this.vestResult.getErrors(field);
    return errors && errors.length > 0 ? errors[0] : '';
  }

  onFileSelect(event: any): void {
    const files = event.files;
    if (files && files.length > 0) {
      const currentFiles = this.state.uploadedFiles();
      patchState(this.state, {
        uploadedFiles: [...currentFiles, ...files],
      });

      this.messageService.add({
        severity: 'success',
        summary: 'File Added',
        detail: `${files.length} file(s) attached`,
      });
    }
  }

  onRemoveFile(file: File): void {
    const currentFiles = this.state.uploadedFiles();
    patchState(this.state, {
      uploadedFiles: currentFiles.filter(f => f !== file),
    });
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    const allFields = Object.keys(this.formData) as Array<keyof BusinessLicenseFormData>;
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);

    patchState(this.state, {
      fieldTouched: touchedFields,
    });

    // Submit through the store
    this.businessLicenseStore.submitApplication(
      this.formData,
      this.state.uploadedFiles(),
      this.vestResult
    );
  }

  onCancel(): void {
    this.businessLicenseStore.cancelAndNavigateBack();
  }
}
