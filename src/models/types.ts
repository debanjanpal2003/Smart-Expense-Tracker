export type EntryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: number;
  type: EntryType;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  note?: string;
  type: EntryType;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  trackIncome: boolean;
}
