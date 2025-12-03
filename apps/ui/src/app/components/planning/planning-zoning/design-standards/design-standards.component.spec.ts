import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesignStandardsComponent } from './design-standards.component';

describe('DesignStandardsComponent', () => {
  let component: DesignStandardsComponent;
  let fixture: ComponentFixture<DesignStandardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignStandardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignStandardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
