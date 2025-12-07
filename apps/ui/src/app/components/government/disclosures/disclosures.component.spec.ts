import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisclosuresComponent } from './disclosures.component';
import { GovernmentDisclosuresStore } from '../../../stores';
import { MessageService } from 'primeng/api';

describe('DisclosuresComponent', () => {
  let component: DisclosuresComponent;
  let fixture: ComponentFixture<DisclosuresComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      resolveDisclosures: jest.fn(),
      governmentDisclosuresEntities: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      downloadDisclosure: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DisclosuresComponent],
      providers: [
        { provide: GovernmentDisclosuresStore, useValue: mockStore },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisclosuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(component.state.searchText()).toBe('');
    expect(component.state.selectedCategory()).toBe('');
    expect(component.state.selectedYear()).toBeNull();
  });

  it('should call resolveDisclosures on init', () => {
    expect(mockStore.resolveDisclosures).toHaveBeenCalled();
  });

  it('should update search text', () => {
    const event = { target: { value: 'test' } } as any;
    component.onSearchChange(event);
    expect(component.state.searchText()).toBe('test');
  });

  it('should update selected category', () => {
    component.onCategoryChange('audit');
    expect(component.state.selectedCategory()).toBe('audit');
  });

  it('should update selected year', () => {
    component.onYearChange(2024);
    expect(component.state.selectedYear()).toBe(2024);
  });

  it('should clear all filters', () => {
    component.onSearchChange({ target: { value: 'test' } } as any);
    component.onCategoryChange('audit');
    component.onYearChange(2024);

    component.onClearFilters();

    expect(component.state.searchText()).toBe('');
    expect(component.state.selectedCategory()).toBeUndefined();
    expect(component.state.selectedYear()).toBeNull();
  });

  it('should delegate download to store', () => {
    const disclosure = {
      id: '1',
      title: 'Test',
      category: 'audit',
      year: 2024,
      fileUrl: '/test.pdf',
      fileName: 'test.pdf',
      fileSize: 1024,
      uploadDate: '2024-01-01',
      description: 'Test disclosure'
    };

    component.onDownload(disclosure);
    expect(mockStore.downloadDisclosure).toHaveBeenCalledWith(disclosure);
  });
});
