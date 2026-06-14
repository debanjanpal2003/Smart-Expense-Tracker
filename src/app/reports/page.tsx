'use client';

import { useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Download, FileSpreadsheet, FileText, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [data, setData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

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
      const topExpense = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      if (topExpense) recs.push(`Your highest spending is on ${topExpense[0]}. Consider reducing it by 10%.`);
      
      const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      if (totalExpense > totalIncome * 0.8) recs.push("You're spending more than 80% of your income. Look for savings opportunities.");
      if (recs.length === 0) recs.push("You're doing great! Keep tracking to see long-term trends.");
      
      setRecommendations(recs);
    }
    loadData();
  }, []);

  const exportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions_export.csv';
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
      head: [['Title', 'Amount', 'Type', 'Category', 'Date']],
      body: transactions.map(t => [t.title, t.amount, t.type, t.categoryId, new Date(t.date).toLocaleDateString()]),
    });
    doc.save('smat_expense_report.pdf');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>Analytics & Reports</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', fontWeight: 600 }}>
            <Download size={18} /> CSV
          </button>
          <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', fontWeight: 600 }}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600 }}>
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', padding: '24px', borderRadius: 'var(--radius)', color: 'white', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Sparkles size={24} />
          <h3 style={{ margin: 0 }}>Smart Recommendations</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '24px' }}>
          {recommendations.map((r, i) => <li key={i} style={{ marginBottom: '8px' }}>{r}</li>)}
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '24px' }}>Income vs Expenses</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '24px' }}>Savings Trend</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.map(d => ({ ...d, savings: d.income - d.expense }))}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Area type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
