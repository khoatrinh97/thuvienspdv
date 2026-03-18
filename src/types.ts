export interface Category {
  id: number;
  name: string;
  icon: string;
  items: Item[];
}

export interface Item {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  features: string[];
  conditions: string;
  details?: string;
  lastUpdated: string;
  qa?: QA[];
}

export interface QA {
  id: number;
  itemId: number;
  question: string;
  answer: string;
}
