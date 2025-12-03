import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoningMapComponent } from './zoning-map.component';

describe('ZoningMapComponent', () => {
  let component: ZoningMapComponent;
  let fixture: ComponentFixture<ZoningMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoningMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoningMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
