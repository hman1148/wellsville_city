import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StormWaterComponent } from './storm-water.component';

describe('StormWaterComponent', () => {
  let component: StormWaterComponent;
  let fixture: ComponentFixture<StormWaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StormWaterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StormWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
