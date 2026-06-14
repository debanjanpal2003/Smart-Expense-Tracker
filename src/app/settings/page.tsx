'use client';

export default function Settings() {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Settings</h2>
      <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Default Currency</label>
          <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
            <option>INR (₹)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input type="checkbox" id="income-tracking" defaultChecked />
          <label htmlFor="income-tracking" style={{ fontWeight: 600 }}>Enable Income Tracking</label>
        </div>
      </div>
    </div>
  );
}
