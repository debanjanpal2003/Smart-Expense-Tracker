'use client';

import { useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Download, FileSpreadsheet, FileText, Sparkles, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [data, setData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const txs = await db.transactions.toArray();
      setTransactions(txs);
      
      const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};
      const categoryTotals: Record<string, number> = {};
      
      txs.forEach(t => {
        const date = new Date(t.date);
        const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }
        
        if (t.type === 'income') {
          monthlyData[monthKey].income += t.amount;
        } else {
          monthlyData[monthKey].expense += t.amount;
          categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
        }
      });

      setData(Object.values(monthlyData));
      
      const recs = [];
      const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
      if (sortedCats.length > 0) {
        recs.push(`You spend the most on items in this category. Try to reduce it.`);
      }
      
      const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      
      if (totalExpense > totalIncome && totalIncome > 0) {
        recs.push("Your expenses exceed your income. Consider reviewing your budget.");
      }
      
      setRecommendations(recs);
      setLoading(false);
    }
    loadData();
  }, []);

  const exportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'smat_expense_export.csv';
    link.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'smat_expense_report.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.text('SmatExpense Financial Report', 14, 15);
    doc.autoTable({
      startY: 25,
      head: [['Title', 'Amount', 'Type', 'Date']],
      body: transactions.map(t => [t.title, t.amount, t.type, new Date(t.date).toLocaleDateString()]),
    });
    doc.save('smat_expense_report.pdf');
  };

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>Analytics</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontWeight: 600, fontSize: '13px' }}>
            <Download size={16} /> CSV
          </button>
          <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', fontWeight: 600, fontSize: '13px' }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '13px' }}>
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '20px', borderRadius: 'var(--radius)', color: 'white', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Sparkles size={20} />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Insights</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            {recommendations.map((r, i) => <li key={i} style={{ marginBottom: '6px' }}>{r}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Income vs Expenses</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '13px'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>Monthly Savings</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.map(d => ({ ...d, savings: d.income - d.expense }))}>
                <defs>
                  <linearGradient id="colorSavingsRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', fontSize: '13px'}} />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavingsRep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {data.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--secondary)', padding: '80px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginTop: '24px' }}>
          <TrendingDown size={48} style={{ marginBottom: '16px', opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, fontSize: '18px' }}>Not Enough Data</h3>
          <p style={{ marginTop: '8px' }}>Add some transactions to see your financial analytics.</p>
        </div>
      )}
    </div>
  );
}
