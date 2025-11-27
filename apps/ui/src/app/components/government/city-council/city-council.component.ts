import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  CouncilMember,
  CouncilContactForm,
  initialCouncilContactForm,
} from '../../../models';
import { cityCouncilFormSuite } from './city-council-form.validation';
import {
  initialCityCouncilFormState,
} from './city-council-form.state';

@Component({
  selector: 'app-city-council',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DividerModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './city-council.component.html',
  styleUrl: './city-council.component.scss',
})
export class CityCouncilComponent {
  readonly messageService = inject(MessageService);
  readonly state = signalState(initialCityCouncilFormState());
  validationResult = signal<ReturnType<typeof cityCouncilFormSuite> | null>(null);

  isFormValid = computed(() => {
    const result = this.validationResult();
    return result ? result.isValid() : false;
  });

  onContactMember(member: CouncilMember): void {
    patchState(this.state, {
      selectedMember: member,
      formData: initialCouncilContactForm(),
      fieldTouched: {},
      showContactDialog: true,
    });
    this.validationResult.set(null);
  }

  onCloseDialog(): void {
    patchState(this.state, {
      showContactDialog: false,
      selectedMember: null,
      formData: initialCouncilContactForm(),
      fieldTouched: {},
    });
    this.validationResult.set(null);
  }

  onFieldChange(field: string, value: string): void {
    patchState(this.state, {
      formData: { ...this.state.formData(), [field]: value },
    });
    this.validateForm();
  }

  onFieldBlur(field: string): void {
    patchState(this.state, {
      fieldTouched: { ...this.state.fieldTouched(), [field]: true },
    });
  }

  validateForm(): void {
    const result = cityCouncilFormSuite(this.state.formData());
    this.validationResult.set(result);
  }

  hasError(field: string): boolean {
    const touched = this.state.fieldTouched()[field];
    const result = this.validationResult();
    return touched && result ? result.hasErrors(field) : false;
  }

  getErrorMessage(field: string): string {
    const result = this.validationResult();
    if (!result || !result.hasErrors(field)) {
      return '';
    }
    const errors = result.getErrors(field);
    return errors.length > 0 ? errors[0] : '';
  }

  onSubmitContactForm(): void {
    // Mark all fields as touched
    const allFields = ['subject', 'fromName', 'fromEmail', 'fromPhone', 'message'];
    const touched: { [key: string]: boolean } = {};
    allFields.forEach((field) => (touched[field] = true));
    patchState(this.state, { fieldTouched: touched });

    // Validate form
    this.validateForm();

    const selectedMember = this.state.selectedMember();
    if (this.isFormValid() && selectedMember) {
      patchState(this.state, { isSubmitting: true });

      const data = this.state.formData();
      const submitData: CouncilContactForm = {
        councilMemberId: selectedMember.id,
        councilMemberName: selectedMember.name,
        councilMemberEmail: selectedMember.email,
        subject: data.subject || '',
        fromName: data.fromName || '',
        fromEmail: data.fromEmail || '',
        fromPhone: data.fromPhone || '',
        message: data.message || '',
      };

      // TODO: Implement email service to send the contact form
      // For now, we'll just log the form data
      console.log('Contact Form Submitted:', submitData);

      // Simulate API call
      setTimeout(() => {
        patchState(this.state, { isSubmitting: false });
        this.messageService.add({
          severity: 'success',
          summary: 'Message Sent',
          detail: `Your message has been sent to ${selectedMember.name}`,
          life: 5000,
        });
        this.onCloseDialog();
      }, 1000);
    }
  }
}
