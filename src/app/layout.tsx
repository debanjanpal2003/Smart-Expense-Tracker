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
    { name: 'AI Insights', href: '/nlp', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="layout-container">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
              <h1 style={{ marginBottom: '32px', color: 'var(--primary)', fontSize: '24px' }}>SmatExpense</h1>
              <nav style={{ flex: 1 }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                        <Icon size={20} />
                        {item.name}
                      </button>
                    </Link>
                  );
                })}
              </nav>
              <Link href="/add">
                <button className="sidebar-nav-item" style={{ background: 'var(--primary)', color: 'white', marginTop: 'auto' }}>
                  <PlusCircle size={20} />
                  Add Transaction
                </button>
              </Link>
            </aside>

            {/* Main Content */}
            <main className="main-content">
              {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="bottom-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <Icon size={24} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link href="/add" className="nav-item">
                <PlusCircle size={32} color="var(--primary)" />
                <span>Add</span>
              </Link>
            </nav>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
