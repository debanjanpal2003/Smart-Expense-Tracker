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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>Transactions</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} accept=".csv" />
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'white', border: '1px solid var(--border)', fontWeight: 600 }}>
            <Upload size={18} /> Import CSV
          </button>
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--expense)', color: 'white', fontWeight: 600 }}>
              <Trash2 size={18} /> Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', background: 'white', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--secondary)' }} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border)' }}
          />
        </div>
        
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
          <ArrowUpDown size={18} /> {sortOrder.toUpperCase()}
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTransactions.map(t => {
          const cat = categories.find(c => c.id === t.categoryId);
          const isSelected = selectedIds.includes(t.id);
          return (
            <div key={t.id} style={{ 
              background: isSelected ? 'var(--accent)' : 'white', 
              padding: '16px', 
              borderRadius: 'var(--radius)', 
              border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              transition: 'all 0.2s'
            }}>
              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(t.id)} />
              
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: (cat?.color || '#eee') + '22', display: 'flex', justifyContent: 'center', alignItems: 'center', color: cat?.color }}>
                {cat?.name?.[0] || '?'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                  {new Date(t.date).toLocaleDateString()} • {t.time} • {cat?.name}
                </div>
              </div>

              {t.note && <div title={t.note} style={{ color: 'var(--secondary)', padding: '8px', cursor: 'help' }}><ChevronDown size={16} /></div>}

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </div>
              </div>

              <button style={{ color: 'var(--secondary)', padding: '4px' }}><MoreVertical size={18} /></button>
            </div>
          );
        })}

        {filteredTransactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '60px', background: 'white', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
            <Filter size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>No transactions match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}
