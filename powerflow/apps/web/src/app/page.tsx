'use client'

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>PowerFlow</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>Welcome to the PowerFlow platform.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href="/dashboard" style={{ padding: '8px 12px', border: '1px solid #334155', borderRadius: 8 }}>Go to Dashboard</a>
        <a href="/login" style={{ padding: '8px 12px', border: '1px solid #334155', borderRadius: 8 }}>Login</a>
      </div>
    </main>
  )
}