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
});
