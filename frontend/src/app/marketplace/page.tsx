import Link from 'next/link';
export default function Marketplace() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-950)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 500, marginBottom: '8px' }}>Marketplace</h1>
        <p style={{ color: 'var(--slate-400)', marginBottom: '24px' }}>Em breve — Semana 2</p>
        <Link href="/" style={{ color: 'var(--green-400)', fontSize: '14px', textDecoration: 'none' }}>← Voltar</Link>
      </div>
    </div>
  );
}
