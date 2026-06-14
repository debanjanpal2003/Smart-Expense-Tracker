'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/core/database/db';
import { Transaction, Category } from '@/models/types';
import { Search, Filter, Trash2, ArrowUpDown, ChevronDown, MoreVertical, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const [txs, cats] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray()
      ]);
      setTransactions(txs);
      setCategories(cats);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.note?.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCat = catFilter === 'all' || t.categoryId === catFilter;
      return matchesSearch && matchesType && matchesCat;
    })
    .sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * factor;
      }
      return (a.amount - b.amount) * factor;
    });

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      await db.transactions.bulkDelete(selectedIds);
      setTransactions(transactions.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const newTxs: Transaction[] = results.data.map((row: any) => ({
            id: uuidv4(),
            title: row.title || 'Imported Transaction',
            amount: parseFloat(row.amount) || 0,
            date: new Date(row.date || new Date()),
            time: row.time || '00:00',
            type: (row.type?.toLowerCase() === 'income' ? 'income' : 'expense') as any,
            categoryId: row.categoryId || 'misc',
            note: row.note || ''
          }));
          await db.transactions.bulkAdd(newTxs);
          const updated = await db.transactions.toArray();
          setTransactions(updated);
          alert(`Successfully imported ${newTxs.length} transactions!`);
        }
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Transactions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} accept=".csv" />
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>
            <Upload size={18} /> Import
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: 'var(--expense)', color: 'white', fontWeight: 600, fontSize: '14px' }}>
              <Trash2 size={18} /> Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Toolbar - Optimized for mobile */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', background: 'white', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ flex: '1 1 100%', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--secondary)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '15px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 100%', overflowX: 'auto', paddingBottom: '4px' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', fontSize: '14px', minWidth: '110px' }}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', fontSize: '14px', minWidth: '130px' }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', fontSize: '14px', whiteSpace: 'nowrap' }}>
            <ArrowUpDown size={16} /> {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTransactions.map(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          const isSelected = selectedIds.includes(t.id);
          return (
            <div key={t.id} style={{ 
              background: isSelected ? 'var(--accent)' : 'white', 
              padding: '12px', 
              borderRadius: 'var(--radius)', 
              border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              transition: 'all 0.2s'
            }}>
              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(t.id)} style={{ width: '18px', height: '18px' }} />
              
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: (cat?.color || '#eee') + '22', display: 'flex', justifyContent: 'center', alignItems: 'center', color: cat?.color, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{cat?.name?.[0] || '?'}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>
                  {new Date(t.date).toLocaleDateString()} • {t.time}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: t.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </div>
              </div>

              <button style={{ color: 'var(--secondary)', padding: '4px' }}><MoreVertical size={18} /></button>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '60px', background: 'white', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
            <Filter size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '15px' }}>No transactions found</div>
          </div>
        )}
      </div>
    </div>
  );
}
