'use client';

import { useState, useEffect } from 'react';
import { db } from '@/core/database/db';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { Category } from '@/models/types';
import { Calendar, Clock, Tag, FileText, IndianRupee, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';

export default function AddTransaction() {
  const router = useRouter();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    note: ''
  });

  useEffect(() => {
    async function loadCategories() {
      const cats = await db.categories.toArray();
      setCategories(cats);
      if (cats.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: cats.find(c => c.type === prev.type)?.id || cats[0].id }));
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return;

    await db.transactions.add({
      id: uuidv4(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      time: formData.time,
      type: formData.type,
      categoryId: formData.categoryId,
      note: formData.note
    });
    router.push('/transactions');
  };

  const getCurrencyIcon = () => {
    switch (profile?.currency) {
      case 'INR': return <IndianRupee size={20} />;
      case 'EUR': return <Euro size={20} />;
      case 'GBP': return <PoundSterling size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>Create Transaction</h2>
        <div style={{ display: 'flex', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setFormData({...formData, type: 'expense', categoryId: categories.find(c => c.type === 'expense')?.id || ''})}
            style={{ padding: '8px 24px', borderRadius: '8px', background: formData.type === 'expense' ? 'var(--expense)' : 'transparent', color: formData.type === 'expense' ? 'white' : 'var(--secondary)', fontWeight: 600 }}
          >
            Expense
          </button>
          <button 
            onClick={() => setFormData({...formData, type: 'income', categoryId: categories.find(c => c.type === 'income')?.id || ''})}
            style={{ padding: '8px 24px', borderRadius: '8px', background: formData.type === 'income' ? 'var(--income)' : 'transparent', color: formData.type === 'income' ? 'white' : 'var(--secondary)', fontWeight: 600 }}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}><FileText size={18} /> Title</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Grocery Shopping"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>{getCurrencyIcon()} Amount</label>
            <input 
              type="number" 
              required
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}><Tag size={18} /> Category</label>
            <select 
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
            >
              {categories.filter(c => c.type === formData.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}><Calendar size={18} /> Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}><Clock size={18} /> Time</label>
            <input 
              type="time" 
              required
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '16px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}><FileText size={18} /> Note (Optional)</label>
          <textarea 
            placeholder="Add details..."
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px', fontSize: '16px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 600, color: 'var(--secondary)' }}>
            Cancel
          </button>
          <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '16px' }}>
            Save Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
