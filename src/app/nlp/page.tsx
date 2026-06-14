'use client';

import React, { useState } from 'react';
import { db } from '@/core/database/db';
import { NLPParser, NLPResult } from '@/features/ai_engine/nlp_parser';
import { StatsEngine } from '@/features/ai_engine/stats_engine';
import { AnomalyDetector } from '@/features/ai_engine/anomaly_detector';
import { MessageSquare, Send, Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function NLPQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const parsed = NLPParser.parse(query);
    const txs = await db.transactions.toArray();
    
    let output: any = { parsed };

    switch (parsed.intent) {
      case 'financial_health':
        output.value = StatsEngine.calculateFinancialHealth(txs);
        output.summary = `Your financial health score is ${output.value.toFixed(1)}/100.`;
        output.recommendation = output.value > 70 ? "You're doing great! Consider investing your surplus." : "Try reducing non-essential expenses to improve your score.";
        break;
      
      case 'detect_anomalies':
        output.data = AnomalyDetector.detectByIQR(txs);
        output.summary = `Found ${output.data.length} unusual transactions.`;
        break;

      case 'filter_transactions':
        const { amount, operator, category } = parsed.entities as any;
        output.data = txs.filter(t => {
          const matchCat = !category || t.categoryId === category;
          const matchAmt = operator === 'above' ? t.amount > amount : t.amount < amount;
          return matchCat && matchAmt;
        });
        output.summary = `Showing ${output.data.length} transactions matching your criteria.`;
        break;

      default:
        output.summary = "I understood your query but I'm still learning how to process this specific request.";
    }

    setResult(output);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '16px', color: 'white' }}>
          <BrainCircuit size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>AI Insights Assistant</h2>
          <p style={{ color: 'var(--secondary)', margin: 0 }}>Ask anything about your finances in plain English.</p>
        </div>
      </div>

      <form onSubmit={handleQuery} style={{ position: 'relative', marginBottom: '40px' }}>
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. 'Give financial health score' or 'Find unusual expenses'"
          style={{ width: '100%', padding: '20px 60px 20px 24px', borderRadius: '20px', border: '2px solid var(--border)', fontSize: '18px', outline: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <button type="submit" style={{ position: 'absolute', right: '12px', top: '12px', background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '12px' }}>
          <Send size={24} />
        </button>
      </form>

      {loading && <div style={{ textAlign: 'center', color: 'var(--secondary)' }}>Analyzing your data...</div>}

      {result && (
        <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontWeight: 600 }}>
            <Sparkles size={18} /> AI Response
          </div>
          
          <h3 style={{ marginBottom: '12px' }}>{result.summary}</h3>
          
          {result.parsed.intent === 'financial_health' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: result.value > 70 ? 'var(--income)' : 'var(--expense)' }}>
                {result.value.toFixed(0)}
              </div>
              <p style={{ color: 'var(--secondary)', marginTop: '12px', padding: '16px', background: 'var(--accent)', borderRadius: '12px' }}>
                <strong>Recommendation:</strong> {result.recommendation}
              </p>
            </div>
          )}

          {result.data && result.data.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.data.slice(0, 5).map((t: any) => (
                <div key={t.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.title}</span>
                  <span style={{ fontWeight: 600, color: 'var(--expense)' }}>-${t.amount}</span>
                </div>
              ))}
              {result.data.length > 5 && <div style={{ fontSize: '12px', color: 'var(--secondary)', textAlign: 'center' }}>+ {result.data.length - 5} more</div>}
            </div>
          )}

          {!loading && result.parsed.intent === 'unknown' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)', background: 'var(--accent)', padding: '16px', borderRadius: '12px' }}>
              <AlertCircle size={20} />
              <span>Try queries like "food expenses above 500" or "show spending trend"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
