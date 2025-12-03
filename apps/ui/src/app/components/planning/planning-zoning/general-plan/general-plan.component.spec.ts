import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralPlanComponent } from './general-plan.component';

describe('GeneralPlanComponent', () => {
  let component: GeneralPlanComponent;
  let fixture: ComponentFixture<GeneralPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralPlanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
