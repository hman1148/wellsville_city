import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CemeteryComponent } from './cemetery.component';

describe('CemeteryComponent', () => {
  let component: CemeteryComponent;
  let fixture: ComponentFixture<CemeteryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CemeteryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CemeteryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize state with default values', () => {
    expect(component.state.isLoading()).toBe(false);
  });

  it('should open fees page in new tab', () => {
    const windowOpenSpy = spyOn(window, 'open');
    component.openFeesPage();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://www.wellsvillecity.com/fee-schedule',
      '_blank'
    );
  });

  it('should open Names in Stone in new tab', () => {
    const windowOpenSpy = spyOn(window, 'open');
    component.openNamesInStone();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://www.namesinstone.com',
      '_blank'
    );
  });

  it('should open USGenWeb in new tab', () => {
    const windowOpenSpy = spyOn(window, 'open');
    component.openUSGenWeb();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://www.usgwarchives.net',
      '_blank'
    );
  });

  it('should open veterans list in new tab', () => {
    const windowOpenSpy = spyOn(window, 'open');
    component.openVeteransList();
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://www.wellsvillecity.com/veterans-list',
      '_blank'
    );
  });
});
