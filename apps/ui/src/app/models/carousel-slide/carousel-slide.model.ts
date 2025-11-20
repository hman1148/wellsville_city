export type CarouselSlide = {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  altText: string;
};

export const initialCarouselSlide = (): CarouselSlide => ({
  id: '',
  imageUrl: '',
  title: undefined,
  description: undefined,
  linkUrl: undefined,
  altText: '',
});
