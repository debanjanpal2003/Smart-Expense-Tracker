import Dexie, { type Table } from 'dexie';
import { Category, Transaction, Budget, UserProfile, AppNotification } from '../../models/types';

export class AppDatabase extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  profile!: Table<UserProfile>;
  notifications!: Table<AppNotification>;

  constructor() {
    super('SmatExpenseDB');
    this.version(2).stores({
      categories: 'id, name, type, isCustom',
      transactions: 'id, title, amount, date, categoryId, type',
      budgets: 'id, categoryId, period',
      profile: 'id, email',
      notifications: 'id, date, isRead'
    });

    this.on('populate', () => this.populate());
  }

  async populate() {
    const defaultCategories: Category[] = [
      // Expense Categories
      { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#ef4444', type: 'expense' },
      { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6', type: 'expense' },
      { id: 'bills', name: 'Bills & Utilities', icon: 'Zap', color: '#f59e0b', type: 'expense' },
      { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
      { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#10b981', type: 'expense' },
      { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#8b5cf6', type: 'expense' },
      { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#f97316', type: 'expense' },
      { id: 'travel', name: 'Travel', icon: 'Plane', color: '#06b6d4', type: 'expense' },
      { id: 'investments', name: 'Investments', icon: 'TrendingUp', color: '#6366f1', type: 'expense' },
      { id: 'insurance', name: 'Insurance', icon: 'Shield', color: '#64748b', type: 'expense' },
      { id: 'personal_care', name: 'Personal Care', icon: 'User', color: '#d946ef', type: 'expense' },
      { id: 'misc', name: 'Miscellaneous', icon: 'Package', color: '#94a3b8', type: 'expense' },
      
      // Income Categories
      { id: 'salary', name: 'Salary', icon: 'Briefcase', color: '#22c55e', type: 'income' },
      { id: 'business', name: 'Business', icon: 'Store', color: '#0ea5e9', type: 'income' },
      { id: 'freelancing', name: 'Freelancing', icon: 'Laptop', color: '#8b5cf6', type: 'income' },
      { id: 'investments_income', name: 'Investments', icon: 'BarChart', color: '#f59e0b', type: 'income' },
      { id: 'other_income', name: 'Other', icon: 'PlusCircle', color: '#64748b', type: 'income' },
    ];

    await this.categories.bulkAdd(defaultCategories);
  }
}

export const db = new AppDatabase();
