import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--green-950)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(77,179,87,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(77,179,87,0.15)', border: '0.5px solid rgba(77,179,87,0.3)', borderRadius: '100px', padding: '4px 16px', fontSize: '11px', color: 'var(--green-300)', letterSpacing: '0.06em', marginBottom: '1.5rem', position: 'relative' }}>
        <div className="pulse-dot" />
        Rede ativa · Polygon Mainnet
      </div>

      <h1 style={{ fontSize: '64px', fontWeight: 500, letterSpacing: '-0.02em', color: 'white', margin: '0 0 0.5rem', position: 'relative' }}>
        Ver<span style={{ color: 'var(--green-400)' }}>dant</span>
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--slate-400)', marginBottom: '2.5rem', position: 'relative' }}>
        Tokenizacao de Ativos Ambientais · dMRV · Polygon
      </p>

      <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', position: 'relative' }}>
        {[
          { value: '2.847', label: 'Toneladas CO₂e tokenizadas' },
          { value: '1.204', label: 'Dispositivos conectados' },
          { value: 'R$ 284k', label: 'Volume marketplace' },
        ].map((s, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 500, color: 'var(--green-300)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '3px' }}>{s.label}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: '0.5px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
        <Link href="/login" style={{ background: 'var(--green-500)', color: 'white', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
          Acessar plataforma
        </Link>
        <Link href="/marketplace" style={{ background: 'transparent', color: 'var(--green-300)', border: '0.5px solid rgba(77,179,87,0.4)', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', textDecoration: 'none' }}>
          Ver marketplace
        </Link>
      </div>
    </main>
  );
}
