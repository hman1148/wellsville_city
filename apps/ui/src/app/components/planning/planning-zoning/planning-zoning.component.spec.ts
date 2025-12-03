import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanningZoningComponent } from './planning-zoning.component';

describe('PlanningZoningComponent', () => {
  let component: PlanningZoningComponent;
  let fixture: ComponentFixture<PlanningZoningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningZoningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningZoningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
