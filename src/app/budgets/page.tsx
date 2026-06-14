'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/core/database/db';
import { Budget, Category, Transaction } from '@/models/types';
import { Target, Plus, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: '', amount: '', period: 'monthly' as const });

  const loadData = async () => {
    const [b, c, t] = await Promise.all([
      db.budgets.toArray(),
      db.categories.toArray(),
      db.transactions.toArray()
    ]);

    const budgetsWithProgress = b.map(budget => {
      const cat = c.find(cat => cat.id === budget.categoryId);
      const spent = t
        .filter(tx => tx.categoryId === budget.categoryId && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      return { ...budget, categoryName: cat?.name, spent, progress: (spent / budget.amount) * 100 };
    });

    setBudgets(budgetsWithProgress);
    const expenseCats = c.filter(cat => cat.type === 'expense');
    setCategories(expenseCats);
    if (expenseCats.length > 0 && !newBudget.categoryId) {
      setNewBudget(prev => ({ ...prev, categoryId: expenseCats[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, [showAdd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.amount || !newBudget.categoryId) return;
    
    await db.budgets.add({
      id: uuidv4(),
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
    setNewBudget({ categoryId: categories[0]?.id || '', amount: '', period: 'monthly' });
    setShowAdd(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget?')) {
      await db.budgets.delete(id);
      loadData();
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Budgets</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' }}>
          <Plus size={20} /> Create Budget
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '32px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>New Category Budget</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>
                <select value={newBudget.categoryId} onChange={e => setNewBudget({...newBudget, categoryId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Amount Limit</label>
                <input type="number" required value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Period</label>
                <select value={newBudget.period} onChange={e => setNewBudget({...newBudget, period: e.target.value as any})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white' }}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: 600 }}>Cancel</button>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 32px', borderRadius: '10px', fontWeight: 600 }}>Create Budget</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
        {budgets.map(budget => (
          <div key={budget.id} style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '16px' }}>{budget.categoryName}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 700, background: 'var(--accent)', padding: '4px 10px', borderRadius: '20px' }}>{budget.period.toUpperCase()}</span>
                <button onClick={() => handleDelete(budget.id)} style={{ color: 'var(--secondary)', padding: '4px' }}><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--secondary)' }}>Spent: <strong>${budget.spent.toFixed(2)}</strong></span>
              <span style={{ color: 'var(--secondary)' }}>Limit: <strong>${budget.amount.toFixed(2)}</strong></span>
            </div>

            <div style={{ width: '100%', height: '10px', background: 'var(--accent)', borderRadius: '5px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, budget.progress)}%`, 
                height: '100%', 
                background: budget.progress > 100 ? 'var(--expense)' : budget.progress > 80 ? '#f59e0b' : 'var(--income)',
                transition: 'width 0.5s ease-out'
              }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {budget.progress > 100 ? (
                <div style={{ color: 'var(--expense)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><AlertTriangle size={14} /> Exceeded by ${(budget.spent - budget.amount).toFixed(2)}</div>
              ) : budget.progress > 80 ? (
                <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><AlertTriangle size={14} /> Approaching limit (80%+)</div>
              ) : (
                <div style={{ color: 'var(--income)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><CheckCircle2 size={14} /> On Track</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {budgets.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '80px', background: 'white', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <Target size={48} style={{ marginBottom: '16px', opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, fontSize: '18px' }}>No Budgets Yet</h3>
          <p style={{ marginTop: '8px' }}>Set limits for categories to stay on track with your savings.</p>
        </div>
      )}
    </div>
  );
}
