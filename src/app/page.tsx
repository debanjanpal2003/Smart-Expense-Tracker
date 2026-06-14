'use client';

import { useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface ChartDataItem {
  name: string;
  value: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpenses: 0 });
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const txs = await db.transactions.toArray();
      const cats = await db.categories.toArray();
      
      let income = 0;
      let expenses = 0;
      const categoryTotals: Record<string, number> = {};

      txs.forEach(t => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += t.amount;
          categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        }
      });

      setSummary({
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses
      });

      const data = Object.entries(categoryTotals).map(([catId, amount]) => {
        const cat = cats.find(c => c.id === catId);
        return {
          name: cat?.name || 'Other',
          value: amount
        };
      });
      setChartData(data);
    }
    loadData();
  }, []);

  const COLORS = ['#2563eb', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Dashboard Overview</h2>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)', marginBottom: '8px' }}>
            <Wallet size={20} />
            <span>Total Balance</span>
          </div>
          <h1 style={{ fontSize: '32px' }}>${summary.totalBalance.toFixed(2)}</h1>
        </div>
        
        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--income)', marginBottom: '8px' }}>
            <ArrowUpCircle size={20} />
            <span>Income</span>
          </div>
          <h1 style={{ fontSize: '32px' }}>${summary.totalIncome.toFixed(2)}</h1>
        </div>

        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--expense)', marginBottom: '8px' }}>
            <ArrowDownCircle size={20} />
            <span>Expenses</span>
          </div>
          <h1 style={{ fontSize: '32px' }}>${summary.totalExpenses.toFixed(2)}</h1>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', height: '400px' }}>
        <h3 style={{ marginBottom: '20px' }}>Spending by Category</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--secondary)' }}>
            No data to display
          </div>
        )}
      </div>
    </div>
  );
}
