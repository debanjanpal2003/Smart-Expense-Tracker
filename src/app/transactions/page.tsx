'use client';

import { useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { Transaction } from '@/models/types';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    db.transactions.reverse().toArray().then(setTransactions);
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Transaction History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map(t => (
          <div key={t.id} style={{ background: 'white', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: '14px', color: 'var(--secondary)' }}>{new Date(t.date).toLocaleDateString()} • {t.categoryId}</div>
            </div>
            <div style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
            </div>
          </div>
        ))}
        {transactions.length === 0 && <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '40px' }}>No transactions found</div>}
      </div>
    </div>
  );
}
