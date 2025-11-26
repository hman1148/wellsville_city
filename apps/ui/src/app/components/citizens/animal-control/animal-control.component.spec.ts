import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalControlComponent } from './animal-control.component';

describe('AnimalControlComponent', () => {
  let component: AnimalControlComponent;
  let fixture: ComponentFixture<AnimalControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct animal control phone number', () => {
    expect(component.animalControlPhone).toBe('435-512-6658');
  });

  it('should have correct humane society phone number', () => {
    expect(component.humaineSocietyPhone).toBe('435-792-3920');
  });

  it('should render the page header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('h1');
    expect(header?.textContent).toContain('Animal Control');
  });

  it('should render contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const phoneLinks = compiled.querySelectorAll('.phone-link');
    expect(phoneLinks.length).toBeGreaterThan(0);
  });

  it('should render wildlife notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const noticeBox = compiled.querySelector('.notice-box');
    expect(noticeBox?.textContent).toContain('wildlife');
  });

  it('should render city ordinance information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ordinanceBox = compiled.querySelector('.ordinance-box');
    expect(ordinanceBox?.textContent).toContain('ordinance');
  });
});
