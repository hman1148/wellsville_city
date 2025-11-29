import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdinancesComponent } from './ordinances.component';

describe('OrdinancesComponent', () => {
  let component: OrdinancesComponent;
  let fixture: ComponentFixture<OrdinancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdinancesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdinancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter ordinances by search query', () => {
    component.onSearchChange('animal');
    expect(component.filteredOrdinances().length).toBeGreaterThan(0);
    expect(
      component.filteredOrdinances().every(
        (ord) =>
          ord.title.toLowerCase().includes('animal') ||
          ord.description.toLowerCase().includes('animal') ||
          ord.keywords.some((k) => k.toLowerCase().includes('animal'))
      )
    ).toBe(true);
  });

  it('should filter ordinances by category', () => {
    component.onCategorySelect('animals');
    expect(component.filteredOrdinances().every((ord) => ord.category === 'animals')).toBe(true);
  });

  it('should clear filters', () => {
    component.onSearchChange('test');
    component.onCategorySelect('animals');
    component.onClearFilters();
    expect(component.state.searchQuery()).toBe('');
    expect(component.state.selectedCategory()).toBeNull();
  });
});
