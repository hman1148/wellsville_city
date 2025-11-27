import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeetingsComponent } from './meetings.component';

describe('MeetingsComponent', () => {
  let component: MeetingsComponent;
  let fixture: ComponentFixture<MeetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format date correctly', () => {
    const dateString = '2025-01-15';
    const formatted = component.formatDate(dateString);
    expect(formatted).toContain('2025');
    expect(formatted).toContain('January');
  });

  it('should format time correctly', () => {
    const timeString = '14:30';
    const formatted = component.formatTime(timeString);
    expect(formatted).toBe('2:30 PM');
  });

  it('should format file size correctly', () => {
    const bytes = 1048576; // 1 MB
    const formatted = component.formatFileSize(bytes);
    expect(formatted).toBe('1.0 MB');
  });

  it('should return correct category label', () => {
    expect(component.getCategoryLabel('agenda')).toBe('Agenda');
    expect(component.getCategoryLabel('minutes')).toBe('Minutes');
    expect(component.getCategoryLabel('discussion')).toBe('Discussion Topics');
  });
});
