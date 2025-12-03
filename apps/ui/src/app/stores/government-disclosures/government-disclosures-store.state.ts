import {
  GovernmentDisclosure,
  initialGovernmentDisclosure,
} from '../../models';

export type GovernmentDisclosuresStoreState = {
  isLoading: boolean;
  isEntitiesLoaded: boolean;
  currentDisclosure: GovernmentDisclosure;
  selectedCategory: string;
  selectedYear: number | null;
};

export const initialGovernmentDisclosuresStoreState =
  (): GovernmentDisclosuresStoreState => ({
    isLoading: false,
    isEntitiesLoaded: false,
    currentDisclosure: initialGovernmentDisclosure(),
    selectedCategory: '',
    selectedYear: null,
  });
