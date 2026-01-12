import type { CategoryType } from './category.types';

export interface Document {
  id: string;
  name: string;
  category: CategoryType;
  date: string;
  size: string;
  type: 'pdf' | 'excel' | 'word';
}
