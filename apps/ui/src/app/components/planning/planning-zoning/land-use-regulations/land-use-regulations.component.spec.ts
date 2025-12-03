import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandUseRegulationsComponent } from './land-use-regulations.component';

describe('LandUseRegulationsComponent', () => {
  let component: LandUseRegulationsComponent;
  let fixture: ComponentFixture<LandUseRegulationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandUseRegulationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandUseRegulationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
