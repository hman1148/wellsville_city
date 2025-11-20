export type NavigationItem = {
  label: string;
  icon?: string;
  routerLink?: string;
  url?: string;
  items?: NavigationItem[];
};

export const initialNavigationItem = (): NavigationItem => ({
  label: '',
  icon: undefined,
  routerLink: undefined,
  url: undefined,
  items: undefined,
});
