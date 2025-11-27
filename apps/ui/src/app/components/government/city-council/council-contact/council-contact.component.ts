import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { signalState, patchState } from '@ngrx/signals';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  CouncilMember,
  CouncilContactForm,
  initialCouncilContactForm,
} from '../../../../models';
import { cityCouncilFormSuite } from '../city-council-form.validation';
import { initialCityCouncilFormState } from '../city-council-form.state';

@Component({
  selector: 'app-council-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './council-contact.component.html',
  styleUrl: './council-contact.component.scss',
})
export class CouncilContactComponent implements OnInit {
  readonly messageService = inject(MessageService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly state = signalState(initialCityCouncilFormState());
  validationResult = signal<ReturnType<typeof cityCouncilFormSuite> | null>(null);

  isFormValid = computed(() => {
    const result = this.validationResult();
    return result ? result.isValid() : false;
  });

  ngOnInit(): void {
    // Get the council member data from route state
    const navigation = this.router.getCurrentNavigation();
    const member = navigation?.extras?.state?.['member'] as CouncilMember;

    if (member) {
      patchState(this.state, {
        selectedMember: member,
        formData: initialCouncilContactForm(),
      });
    } else {
      // If no member data, redirect back to city council
      this.router.navigate(['/government/city-council']);
    }
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

        // Navigate back to city council page after a delay
        setTimeout(() => {
          this.router.navigate(['/government/city-council']);
        }, 2000);
      }, 1000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/government/city-council']);
  }
}
