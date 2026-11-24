export interface Chapter {
  id: string;
  name: string;
  content: string;
  order: number;
}

export type Theme = 'light' | 'charcoal' | 'darkblue' | 'sepia';

export type ReadingMode = 'continuous' | 'chapter';
