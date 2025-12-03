import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanningCommissionComponent } from './planning-commission.component';

describe('PlanningCommissionComponent', () => {
  let component: PlanningCommissionComponent;
  let fixture: ComponentFixture<PlanningCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningCommissionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanningCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
