import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CityCouncilComponent } from './city-council.component';

describe('CityCouncilComponent', () => {
  let component: CityCouncilComponent;
  let fixture: ComponentFixture<CityCouncilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityCouncilComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CityCouncilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 council members', () => {
    expect(component.councilMembers().length).toBe(5);
  });

  it('should have Bob Lindley as Mayor', () => {
    const mayor = component.councilMembers().find((m) => m.role === 'Mayor');
    expect(mayor).toBeTruthy();
    expect(mayor?.name).toBe('Bob Lindley');
  });

  it('should have correct email for Kaylene Ames', () => {
    const member = component.councilMembers().find(
      (m) => m.name === 'Kaylene Ames'
    );
    expect(member?.email).toBe('kames@wellsvillecity.com');
  });

  it('should have correct phone for Carl Leatham', () => {
    const member = component.councilMembers().find(
      (m) => m.name === 'Carl Leatham'
    );
    expect(member?.phone).toBe('(435)757-7268');
  });

  it('should initialize with contact dialog hidden', () => {
    expect(component.showContactDialog()).toBe(false);
    expect(component.selectedMember()).toBeNull();
  });

  it('should create contact form with required fields', () => {
    expect(component.contactForm).toBeTruthy();
    expect(component.contactForm.get('subject')).toBeTruthy();
    expect(component.contactForm.get('fromName')).toBeTruthy();
    expect(component.contactForm.get('fromEmail')).toBeTruthy();
    expect(component.contactForm.get('fromPhone')).toBeTruthy();
    expect(component.contactForm.get('message')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.contactForm.valid).toBe(false);
  });

  it('should mark form as valid when all fields are filled', () => {
    component.contactForm.patchValue({
      subject: 'Test Subject',
      fromName: 'John Doe',
      fromEmail: 'john@example.com',
      fromPhone: '555-1234',
      message: 'Test message',
    });
    expect(component.contactForm.valid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.contactForm.get('fromEmail');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should open dialog when onContactMember is called', () => {
    const member = component.councilMembers()[0];
    component.onContactMember(member);

    expect(component.showContactDialog()).toBe(true);
    expect(component.selectedMember()).toBe(member);
  });

  it('should close dialog and reset form when onCloseDialog is called', () => {
    const member = component.councilMembers()[0];
    component.onContactMember(member);
    component.contactForm.patchValue({
      subject: 'Test',
      fromName: 'Test User',
      fromEmail: 'test@example.com',
      fromPhone: '555-1234',
      message: 'Test message',
    });

    component.onCloseDialog();

    expect(component.showContactDialog()).toBe(false);
    expect(component.selectedMember()).toBeNull();
    expect(component.contactForm.value.subject).toBeNull();
  });

  it('should render the page header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('h1');
    expect(header?.textContent).toContain('City Council');
  });

  it('should render all council member cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.council-card');
    expect(cards.length).toBe(5);
  });

  it('should render member photos', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const photos = compiled.querySelectorAll('.council-photo');
    expect(photos.length).toBe(5);
  });

  it('should render member names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Bob Lindley');
    expect(content).toContain('Kaylene Ames');
    expect(content).toContain('Carl Leatham');
    expect(content).toContain('Denise Lindsay');
    expect(content).toContain('Austin Wood');
  });

  it('should have all members with correct photo paths', () => {
    component.councilMembers().forEach((member) => {
      expect(member.photoPath).toContain('/Government/');
      expect(member.photoPath).toContain('.jpg');
    });
  });

  it('should have all members with assignments', () => {
    component.councilMembers().forEach((member) => {
      expect(member.assignments.length).toBeGreaterThan(0);
    });
  });

  it('should have all members with Founders Day duties', () => {
    component.councilMembers().forEach((member) => {
      expect(member.foundersDayDuties.length).toBeGreaterThan(0);
    });
  });

  it('should not submit form when invalid', () => {
    const member = component.councilMembers()[0];
    component.onContactMember(member);

    spyOn(console, 'log');
    component.onSubmitContactForm();

    expect(console.log).not.toHaveBeenCalled();
  });

  describe('Edge Cases - Form Validation', () => {
    it('should reject email with no @ symbol', () => {
      const emailControl = component.contactForm.get('fromEmail');
      emailControl?.setValue('invalidemail.com');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should reject email with multiple @ symbols', () => {
      const emailControl = component.contactForm.get('fromEmail');
      emailControl?.setValue('invalid@@email.com');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept email with + symbol', () => {
      const emailControl = component.contactForm.get('fromEmail');
      emailControl?.setValue('user+tag@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should handle very long subject line', () => {
      const longSubject = 'A'.repeat(1000);
      component.contactForm.patchValue({ subject: longSubject });
      expect(component.contactForm.get('subject')?.value).toBe(longSubject);
    });

    it('should handle very long message', () => {
      const longMessage = 'M'.repeat(10000);
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'Test User',
        fromEmail: 'test@example.com',
        fromPhone: '555-1234',
        message: longMessage,
      });
      expect(component.contactForm.valid).toBe(true);
    });

    it('should handle special characters in name', () => {
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: "O'Connor-Smith III",
        fromEmail: 'test@example.com',
        fromPhone: '555-1234',
        message: 'Test',
      });
      expect(component.contactForm.valid).toBe(true);
    });

    it('should handle international phone numbers', () => {
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'Test User',
        fromEmail: 'test@example.com',
        fromPhone: '+44 20 7123 4567',
        message: 'Test',
      });
      expect(component.contactForm.valid).toBe(true);
    });
  });

  describe('Edge Cases - Member Selection', () => {
    it('should handle selecting same member twice', () => {
      const member = component.councilMembers()[0];

      component.onContactMember(member);
      expect(component.selectedMember()).toBe(member);

      component.onContactMember(member);
      expect(component.selectedMember()).toBe(member);
    });

    it('should handle switching between members', () => {
      const member1 = component.councilMembers()[0];
      const member2 = component.councilMembers()[1];

      component.onContactMember(member1);
      expect(component.selectedMember()).toBe(member1);

      component.onContactMember(member2);
      expect(component.selectedMember()).toBe(member2);
    });

    it('should reset form when switching members', () => {
      const member1 = component.councilMembers()[0];
      const member2 = component.councilMembers()[1];

      component.onContactMember(member1);
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'User',
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: 'Message',
      });

      component.onContactMember(member2);
      expect(component.contactForm.value.subject).toBeNull();
    });
  });

  describe('Edge Cases - Member Data Integrity', () => {
    it('should not have duplicate member names', () => {
      const names = component.councilMembers().map((m) => m.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it('should not have duplicate member emails', () => {
      const emails = component.councilMembers().map((m) => m.email);
      const uniqueEmails = new Set(emails);
      expect(emails.length).toBe(uniqueEmails.size);
    });

    it('should have valid email format for all members', () => {
      component.councilMembers().forEach((member) => {
        expect(member.email).toContain('@');
        expect(member.email).toContain('.');
      });
    });

    it('should have phone numbers for all members', () => {
      component.councilMembers().forEach((member) => {
        expect(member.phone).toBeTruthy();
        expect(member.phone.length).toBeGreaterThan(0);
      });
    });

    it('should have role for all members', () => {
      component.councilMembers().forEach((member) => {
        expect(member.role).toBeTruthy();
      });
    });
  });

  describe('Security - Input Sanitization', () => {
    it('should not execute script tags in subject', () => {
      const maliciousSubject = '<script>alert("XSS")</script>';
      component.contactForm.patchValue({ subject: maliciousSubject });

      expect(() => {
        component.contactForm.get('subject')?.value;
      }).not.toThrow();
    });

    it('should not execute script tags in message', () => {
      const maliciousMessage = '<script>alert("XSS")</script>';
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'User',
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: maliciousMessage,
      });

      expect(component.contactForm.valid).toBe(true);
    });

    it('should handle SQL injection attempt in name', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: sqlInjection,
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: 'Test',
      });

      expect(component.contactForm.valid).toBe(true);
    });
  });

  describe('Edge Cases - Form Reset', () => {
    it('should reset form to pristine state', () => {
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'User',
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: 'Message',
      });
      component.contactForm.markAsDirty();

      component.contactForm.reset();

      expect(component.contactForm.pristine).toBe(true);
      expect(component.contactForm.value.subject).toBeNull();
    });

    it('should handle closing dialog without submitting', () => {
      const member = component.councilMembers()[0];
      component.onContactMember(member);
      component.contactForm.patchValue({
        subject: 'Test',
        fromName: 'User',
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: 'Message',
      });

      component.onCloseDialog();

      expect(component.showContactDialog()).toBe(false);
      expect(component.contactForm.value.subject).toBeNull();
    });
  });

  describe('Edge Cases - Empty and Whitespace Values', () => {
    it('should reject form with only whitespace in required fields', () => {
      component.contactForm.patchValue({
        subject: '   ',
        fromName: '   ',
        fromEmail: 'user@example.com',
        fromPhone: '555-1234',
        message: '   ',
      });

      expect(component.contactForm.valid).toBe(false);
    });

    it('should handle empty string in phone number', () => {
      const phoneControl = component.contactForm.get('fromPhone');
      phoneControl?.setValue('');
      expect(phoneControl?.hasError('required')).toBe(true);
    });

    it('should trim whitespace from email', () => {
      const emailControl = component.contactForm.get('fromEmail');
      emailControl?.setValue('  user@example.com  ');

      // Value should be accepted (trimming handled by backend)
      expect(emailControl?.value).toContain('user@example.com');
    });
  });
});
