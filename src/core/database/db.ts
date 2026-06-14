import Dexie, { type Table } from 'dexie';
import { Category, Transaction, Budget, User } from '../../models/types';

export class AppDatabase extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  settings!: Table<User>;

  constructor() {
    super('SmatExpenseDB');
    this.version(1).stores({
      categories: 'id, name, type',
      transactions: 'id, title, amount, date, categoryId, type',
      budgets: 'id, categoryId, period',
      settings: 'id, email'
    });
  }
}

export const db = new AppDatabase();
