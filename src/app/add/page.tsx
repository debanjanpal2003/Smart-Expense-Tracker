'use client';

import { useState } from 'react';
import { db } from '@/core/database/db';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function AddTransaction() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    categoryId: 'food',
    note: ''
  });

  const categories = [
    { id: 'food', name: 'Food' },
    { id: 'transport', name: 'Transport' },
    { id: 'bills', name: 'Bills' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'salary', name: 'Salary' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.transactions.add({
      id: uuidv4(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: new Date(),
      type: formData.type as 'income' | 'expense',
      categoryId: formData.categoryId,
      note: formData.note
    });
    router.push('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Amount</label>
            <input 
              type="number" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Category</label>
          <select 
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Note (Optional)</label>
          <textarea 
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '16px' }}>
          Save Transaction
        </button>
      </form>
    </div>
  );
}
