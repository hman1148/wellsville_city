import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryComponent } from './library.component';

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct library name', () => {
    expect(component.libraryName).toBe('Hyrum City Library');
  });

  it('should have correct address', () => {
    expect(component.address).toBe('50 West Main');
    expect(component.city).toBe('Hyrum');
    expect(component.state).toBe('UT');
    expect(component.zipCode).toBe('84319');
  });

  it('should have correct phone number', () => {
    expect(component.phone).toBe('435-245-6411');
  });

  it('should have correct hours', () => {
    expect(component.hours).toBe('M-F 10-7, Sat. 10-3');
  });

  it('should have correct website URL', () => {
    expect(component.websiteUrl).toBe('http://www.hyrumcity.gov/library');
  });

  it('should have correct online library URL', () => {
    expect(component.onlineLibraryUrl).toBe('https://utahsonlinelibrary.org/');
  });

  it('should have correct image path', () => {
    expect(component.imagePath).toBe('/library.png');
  });

  it('should return correct full address', () => {
    const expectedAddress = '50 West Main, Hyrum, UT 84319';
    expect(component.fullAddress).toBe(expectedAddress);
  });

  it('should render the page header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('h1');
    expect(header?.textContent).toContain('Library Services');
  });

  it('should render library name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const libraryTitle = compiled.querySelector('.library-title');
    expect(libraryTitle?.textContent).toContain('Hyrum City Library');
  });

  it('should render library image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('.library-image') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image?.src).toContain('library.png');
  });

  it('should render location information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const locationBox = compiled.querySelector('.location-box');
    expect(locationBox?.textContent).toContain('50 West Main');
    expect(locationBox?.textContent).toContain('435-245-6411');
  });

  it('should render hours information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hoursText = compiled.querySelector('.hours-text');
    expect(hoursText?.textContent).toContain('M-F 10-7');
  });

  it('should render resource cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const resourceCards = compiled.querySelectorAll('.resource-card');
    expect(resourceCards.length).toBe(2);
  });

  it('should render website button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('p-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should open website URL when onVisitWebsite is called', () => {
    spyOn(window, 'open');
    component.onVisitWebsite();
    expect(window.open).toHaveBeenCalledWith(
      'http://www.hyrumcity.gov/library',
      '_blank'
    );
  });

  it('should open online library URL when onVisitOnlineLibrary is called', () => {
    spyOn(window, 'open');
    component.onVisitOnlineLibrary();
    expect(window.open).toHaveBeenCalledWith(
      'https://utahsonlinelibrary.org/',
      '_blank'
    );
  });

  it('should render intro box with utility bill information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const introBox = compiled.querySelector('.intro-box');
    expect(introBox?.textContent).toContain('Wellsville City Utility bill');
  });

  it('should render note box', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const noteBox = compiled.querySelector('.note-box');
    expect(noteBox?.textContent).toContain('library card');
  });
});
