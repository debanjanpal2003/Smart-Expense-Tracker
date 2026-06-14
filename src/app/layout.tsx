'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, PieChart, Settings, PlusCircle, Target, Activity } from 'lucide-react';
import { AuthProvider } from '@/core/auth/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ReceiptText },
    { name: 'Budgets', href: '/budgets', icon: Target },
    { name: 'Reports', href: '/reports', icon: PieChart },
    { name: 'AI Assistant', href: '/nlp', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="layout-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px', color: 'white' }}>
                  <Activity size={24} />
                </div>
                <h1 style={{ color: 'var(--foreground)', fontSize: '20px', fontWeight: 800, margin: 0 }}>SmatExpense</h1>
              </div>
              
              <nav style={{ flex: 1 }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                        <Icon size={18} />
                        {item.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>

              <Link href="/add">
                <button className="sidebar-nav-item" style={{ background: 'var(--primary)', color: 'white', marginTop: '20px', padding: '14px' }}>
                  <PlusCircle size={18} />
                  Add Transaction
                </button>
              </Link>
            </aside>

            {/* Main Content */}
            <main className="main-content">
              {children}
            </main>

            {/* Mobile Bottom Nav - Improved scaling */}
            <nav className="bottom-nav">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link href="/add" className="nav-item">
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '50%', marginTop: '-20px', boxShadow: '0 4px 10px rgb(37 99 235 / 0.3)' }}>
                  <PlusCircle size={24} color="white" />
                </div>
                <span style={{ marginTop: '4px' }}>Add</span>
              </Link>
            </nav>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
