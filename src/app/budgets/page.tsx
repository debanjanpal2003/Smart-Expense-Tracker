'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/core/database/db';
import { Budget, Category, Transaction } from '@/models/types';
import { Target, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: '', amount: '', period: 'monthly' as const });

  useEffect(() => {
    async function loadData() {
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
      setCategories(c.filter(cat => cat.type === 'expense'));
      if (c.length > 0) setNewBudget(prev => ({ ...prev, categoryId: c[0].id }));
    }
    loadData();
  }, [showAdd]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.budgets.add({
      id: uuidv4(),
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
    setShowAdd(false);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>Budget Management</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Plus size={20} /> Create Budget
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ marginBottom: '20px' }}>New Category Budget</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>
              <select value={newBudget.categoryId} onChange={e => setNewBudget({...newBudget, categoryId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Amount</label>
              <input type="number" value={newBudget.amount} onChange={e => setNewBudget({...newBudget, amount: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Period</label>
              <select value={newBudget.period} onChange={e => setNewBudget({...newBudget, period: e.target.value as any})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>Save</button>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {budgets.map(budget => (
          <div key={budget.id} style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ margin: 0 }}>{budget.categoryName}</h4>
              <span style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 600 }}>{budget.period.toUpperCase()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--secondary)' }}>Spent: <strong>${budget.spent.toFixed(2)}</strong></span>
              <span style={{ color: 'var(--secondary)' }}>Limit: <strong>${budget.amount.toFixed(2)}</strong></span>
            </div>

            <div style={{ width: '100%', height: '12px', background: 'var(--accent)', borderRadius: '6px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, budget.progress)}%`, 
                height: '100%', 
                background: budget.progress > 100 ? 'var(--expense)' : budget.progress > 80 ? '#f59e0b' : 'var(--income)',
                transition: 'width 0.5s ease-out'
              }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {budget.progress > 100 ? (
                <div style={{ color: 'var(--expense)', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> Budget Exceeded!</div>
              ) : budget.progress > 80 ? (
                <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> 80% Threshold Reached</div>
              ) : (
                <div style={{ color: 'var(--income)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> On Track</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
