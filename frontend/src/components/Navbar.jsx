export default function Navbar() {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e2e2', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600 }}>
        <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Q</div>
        AI Quiz Generator
      </div>
    </div>
  );
}