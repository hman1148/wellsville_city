import { Ordinance, OrdinanceCategory } from '../../../models';
import { ORDINANCES_DATA } from '../../../data/ordinances.data';

export type OrdinancesState = {
  ordinances: Ordinance[];
  searchQuery: string;
  selectedCategory: OrdinanceCategory | null;
  searchSuggestions: string[];
};

export const initialOrdinancesState = (): OrdinancesState => ({
  ordinances: ORDINANCES_DATA,
  searchQuery: '',
  selectedCategory: null,
  searchSuggestions: [],
});
