import { disclosureCategories, DisclosureCategoryItem } from "../../../models";

export type DisclosureComponentState = {
    searchText: string;
    selectedCategory: string;
    selectedYear: number | null;
    disclosureCategories: DisclosureCategoryItem[];
    availabileYears: { label: string; value: number }[];
}

export const initialDisclousreComponentState = (): DisclosureComponentState => ({
    searchText: '',
    selectedCategory: '',
    selectedYear: null,
    disclosureCategories: disclosureCategories,
    availabileYears: [],
})