'use client';

import { useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { Transaction, Category } from '@/models/types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, 
  Calendar, PieChart as PieIcon, Activity, Target
} from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState({ 
    totalBalance: 0, 
    totalIncome: 0, 
    totalExpenses: 0,
    netSavings: 0,
    avgDailySpend: 0,
    budgetUtilization: 0
  });
  const [catData, setCatData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const txs = await db.transactions.toArray();
      const cats = await db.categories.toArray();
      
      let income = 0;
      let expenses = 0;
      const categoryTotals: Record<string, number> = {};
      const dailyTotals: Record<string, number> = {};

      txs.forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString();
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += t.amount;
          categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
          dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + t.amount;
        }
      });

      // Calculate Widgets
      const daysCount = Object.keys(dailyTotals).length || 1;
      setSummary({
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income > 0 ? ((income - expenses) / income) * 100 : 0,
        avgDailySpend: expenses / daysCount,
        budgetUtilization: 65 // Mock for now until Budget module is active
      });

      // Category Data
      const pieData = Object.entries(categoryTotals).map(([catId, amount]) => {
        const cat = cats.find(c => c.id === catId);
        return { name: cat?.name || 'Other', value: amount, color: cat?.color || '#888' };
      });
      setCatData(pieData);

      // Trend Data (Last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString();
        return {
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          amount: dailyTotals[dateStr] || 0
        };
      }).reverse();
      setTrendData(last7Days);
    }
    loadData();
  }, []);

  const COLORS = ['#2563eb', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const Widget = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: color + '15', padding: '10px', borderRadius: '12px', color: color }}>
          <Icon size={24} />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 600 }}>{subtext}</div>
      </div>
      <div>
        <div style={{ fontSize: '14px', color: 'var(--secondary)', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Good Morning, {profile?.name || 'User'}!</h2>
          <p style={{ color: 'var(--secondary)', margin: 0 }}>Here's your financial summary for today.</p>
        </div>
        <button style={{ background: 'var(--accent)', padding: '10px 20px', borderRadius: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} /> This Month
        </button>
      </div>
      
      {/* 6 Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <Widget title="Total Balance" value={`${profile?.currency === 'INR' ? '₹' : '$'}${summary.totalBalance.toLocaleString()}`} icon={Wallet} color="#2563eb" subtext="Available" />
        <Widget title="Total Income" value={`${profile?.currency === 'INR' ? '₹' : '$'}${summary.totalIncome.toLocaleString()}`} icon={ArrowUpCircle} color="#22c55e" subtext="+12% vs last month" />
        <Widget title="Total Expenses" value={`${profile?.currency === 'INR' ? '₹' : '$'}${summary.totalExpenses.toLocaleString()}`} icon={ArrowDownCircle} color="#ef4444" subtext="-5% vs last month" />
        <Widget title="Net Savings" value={`${summary.netSavings.toFixed(1)}%`} icon={TrendingUp} color="#8b5cf6" subtext="of total income" />
        <Widget title="Daily Avg" value={`${profile?.currency === 'INR' ? '₹' : '$'}${summary.avgDailySpend.toLocaleString()}`} icon={Activity} color="#f59e0b" subtext="Last 30 days" />
        <Widget title="Budget Used" value={`${summary.budgetUtilization}%`} icon={Target} color="#ec4899" subtext="4 active budgets" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Spending Trend */}
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Spending Trend</h3>
            <PieIcon size={20} color="var(--secondary)" />
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '24px' }}>Category Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
