import { Newsletter, initialNewsletter } from '../../models';

export type NewsletterStoreState = {
  isEntitiesLoaded: boolean;
  isLoading: boolean;
  newsletters: Newsletter[];
  selectedNewsletter: Newsletter;
  previewUrl: string;
};

export const initialNewsletterStoreState = (): NewsletterStoreState => ({
  isEntitiesLoaded: false,
  isLoading: false,
  newsletters: [],
  selectedNewsletter: initialNewsletter(),
  previewUrl: '',
});
