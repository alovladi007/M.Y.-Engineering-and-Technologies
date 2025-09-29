export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Admin</h1>
      <p style={{ opacity: 0.8 }}>Choose a destination:</p>
      <ul style={{ marginTop: 12 }}>
        <li><a href="/admin/dashboard">Dashboard</a></li>
        <li><a href="/">Back to Home</a></li>
      </ul>
    </main>
  )
}