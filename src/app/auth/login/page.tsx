'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/core/database/db';
import { useAuth } from '@/core/auth/AuthContext';
import { Shield, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const profiles = await db.profile.where('email').equalsIgnoreCase(formData.email).toArray();
    const user = profiles[0];

    if (user && user.passwordHash === formData.password) {
      await refreshProfile();
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'var(--accent)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 16px' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ margin: 0 }}>Welcome Back</h2>
          <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>Log in to access your finances</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px', color: 'var(--expense)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--secondary)' }} />
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)' }} placeholder="john@example.com" />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--secondary)' }} />
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)' }} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Log In <LogIn size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--secondary)' }}>
          Don't have an account? <button onClick={() => router.push('/auth/signup')} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</button>
        </p>
      </div>
    </div>
  );
}
