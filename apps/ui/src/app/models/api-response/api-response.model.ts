export type ItemResponse<T> = {
  item: T;
  success: boolean;
  message?: string;
};

export type ItemsResponse<T> = {
  items: T[];
  success: boolean;
  message?: string;
  total?: number;
};
