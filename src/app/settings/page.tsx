'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/core/database/db';
import { useAuth } from '@/core/auth/AuthContext';
import { User, Shield, Bell, CreditCard, LogOut } from 'lucide-react';

export default function Settings() {
  const { profile, refreshProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    trackIncome: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        currency: profile.currency,
        trackIncome: profile.trackIncome,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (profile) {
      await db.profile.update(profile.id, formData);
      await refreshProfile();
      alert('Settings saved successfully!');
    }
  };

  if (!profile) return null;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '32px' }}>Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        {/* Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--accent)', color: 'var(--primary)', fontWeight: 600 }}>
            <User size={20} /> Profile
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: 'var(--secondary)' }}>
            <Shield size={20} /> Security
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: 'var(--secondary)' }}>
            <Bell size={20} /> Notifications
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: 'var(--secondary)' }}>
            <CreditCard size={20} /> Subscription
          </button>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: 'var(--expense)' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Form */}
        <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Display Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Default Currency</label>
            <select 
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="checkbox" 
                id="income-tracking" 
                checked={formData.trackIncome}
                onChange={e => setFormData({...formData, trackIncome: e.target.checked})}
              />
              <label htmlFor="income-tracking" style={{ fontWeight: 600 }}>Enable Income Tracking</label>
            </div>
            <p style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '8px', marginLeft: '28px' }}>
              Allows you to record and analyze your earnings alongside expenses.
            </p>
          </div>

          <button 
            onClick={handleSave}
            style={{ width: '100%', padding: '16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 600 }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
