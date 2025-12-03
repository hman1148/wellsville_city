import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendasMinutesComponent } from './agendas-minutes.component';

describe('AgendasMinutesComponent', () => {
  let component: AgendasMinutesComponent;
  let fixture: ComponentFixture<AgendasMinutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendasMinutesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendasMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
