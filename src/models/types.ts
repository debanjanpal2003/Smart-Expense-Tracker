export type EntryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string; // Changed to string for Hex support
  type: EntryType;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
  time: string; // Added time
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // For local auth
  currency: string;
  trackIncome: boolean;
  onboardingComplete: boolean;
  createdAt: Date;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  date: Date;
  isRead: boolean;
}
