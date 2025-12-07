import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessLicenseInformationComponent } from './business-license-information.component';

describe('BusinessLicenseInformationComponent', () => {
  let component: BusinessLicenseInformationComponent;
  let fixture: ComponentFixture<BusinessLicenseInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessLicenseInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessLicenseInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
