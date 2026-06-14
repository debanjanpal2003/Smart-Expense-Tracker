'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/core/database/db';
import { useAuth } from '@/core/auth/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, ChevronRight, ChevronLeft, User, DollarSign, List, Flag } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { refreshProfile } = useAuth();
  const router = useRouter();

  // Step 1: Profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currency: 'USD',
    trackIncome: true,
  });

  // Step 2 & 3: Categories (Selection)
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const cats = await db.categories.toArray();
      setAllCategories(cats);
      setSelectedExpenseCategories(cats.filter(c => c.type === 'expense').map(c => c.id));
      setSelectedIncomeCategories(cats.filter(c => c.type === 'income').map(c => c.id));
    }
    loadCategories();
  }, []);

  const handleComplete = async () => {
    const newUser = {
      id: uuidv4(),
      ...profile,
      onboardingComplete: true,
      createdAt: new Date(),
    };
    await db.profile.add(newUser);
    await refreshProfile();
    router.push('/');
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Welcome to SmatExpense</h1>
        <p style={{ color: 'var(--secondary)' }}>Let's set up your account in {step}/4 steps</p>
      </div>

      <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><User size={24} /></div>
              <h3 style={{ margin: 0 }}>Basic Profile</h3>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="John Doe" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="john@example.com" />
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Currency</label>
                <select value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                <input type="checkbox" checked={profile.trackIncome} onChange={e => setProfile({...profile, trackIncome: e.target.checked})} id="track-income" />
                <label htmlFor="track-income" style={{ fontWeight: 600 }}>Track Income</label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><List size={24} /></div>
              <h3 style={{ margin: 0 }}>Expense Categories</h3>
            </div>
            <p style={{ marginBottom: '20px', color: 'var(--secondary)', fontSize: '14px' }}>Choose the categories you want to track.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '2px' }}>
              {allCategories.filter(c => c.type === 'expense').map(cat => (
                <div key={cat.id} onClick={() => {
                  if (selectedExpenseCategories.includes(cat.id)) {
                    setSelectedExpenseCategories(s => s.filter(id => id !== cat.id));
                  } else {
                    setSelectedExpenseCategories(s => [...s, cat.id]);
                  }
                }} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${selectedExpenseCategories.includes(cat.id) ? 'var(--primary)' : 'var(--border)'}`, background: selectedExpenseCategories.includes(cat.id) ? 'var(--accent)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }}></div>
                  <span style={{ fontSize: '14px' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}><DollarSign size={24} /></div>
              <h3 style={{ margin: 0 }}>Income Categories</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {allCategories.filter(c => c.type === 'income').map(cat => (
                <div key={cat.id} onClick={() => {
                  if (selectedIncomeCategories.includes(cat.id)) {
                    setSelectedIncomeCategories(s => s.filter(id => id !== cat.id));
                  } else {
                    setSelectedIncomeCategories(s => [...s, cat.id]);
                  }
                }} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${selectedIncomeCategories.includes(cat.id) ? 'var(--primary)' : 'var(--border)'}`, background: selectedIncomeCategories.includes(cat.id) ? 'var(--accent)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }}></div>
                  <span style={{ fontSize: '14px' }}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--income)', marginBottom: '24px' }}><CheckCircle2 size={64} style={{ margin: '0 auto' }} /></div>
            <h3>All Set!</h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '32px' }}>Your personal finance tracker is ready to go. You can always change these settings later.</p>
            <div style={{ background: 'var(--accent)', padding: '16px', borderRadius: 'var(--radius)', textAlign: 'left', marginBottom: '32px' }}>
              <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {profile.name}</div>
              <div style={{ marginBottom: '8px' }}><strong>Currency:</strong> {profile.currency}</div>
              <div><strong>Categories:</strong> {selectedExpenseCategories.length + selectedIncomeCategories.length} tracked</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          {step > 1 ? (
            <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
              <ChevronLeft size={20} /> Back
            </button>
          ) : <div></div>}
          
          {step < 4 ? (
            <button onClick={nextStep} style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={handleComplete} style={{ background: 'var(--income)', color: 'white', padding: '10px 32px', borderRadius: '8px', fontWeight: 600 }}>
              Start Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
