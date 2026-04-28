'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';

const BARS = [30, 55, 70, 90, 100, 85, 75];
const DMRV = [
  { label: 'Ingestao adapter', value: 'OK' },
  { label: 'Normalizacao Claude', value: 'OK · 0.99' },
  { label: 'Validacao NASA POWER', value: 'OK · Δ2.1%' },
  { label: 'Mint Polygon', value: 'OK' },
];

export default function ProducerDashboard() {
  const [user, setUser] = useState({ fullName: 'Produtor', role: 'PRODUCER' as const });
  const [ts, setTs] = useState('...');

  useEffect(() => {
    const u = localStorage.getItem('verdant_user');
    if (u) setUser(JSON.parse(u));
    setTs(new Date().toLocaleString('pt-BR'));
  }, []);

  const metrics = [
    { icon: '⚡', label: 'Potencia atual', value: '12.5', unit: 'kW', trend: '↑ 8% vs ontem', tc: '#4ade80' },
    { icon: '🔋', label: 'Energia gerada', value: '450.2', unit: 'kWh acumulado', trend: '↑ 12% este mes', tc: '#4ade80' },
    { icon: '🌱', label: 'CO₂ evitado', value: '36.8', unit: 'kg CO₂e', trend: '↑ 5% esta semana', tc: '#4ade80' },
    { icon: '🪙', label: 'Tokens VCC', value: '0.0368', unit: '1 VCC = 1 tCO₂e', trend: '≈ R$ 3,68', tc: '#facc15' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-950)' }}>
      <TopBar userName={user.fullName} role={user.role} />
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: 'white', margin: 0 }}>Dashboard de telemetria</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--green-400)', background: 'rgba(77,179,87,0.1)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '100px', padding: '2px 10px' }}>INV-WEG-001</span>
            <span style={{ fontSize: '11px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)', borderRadius: '100px', padding: '2px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '5px', height: '5px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />Online
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>{m.icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: 'white' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--green-400)', marginTop: '3px' }}>{m.unit}</div>
              <div style={{ fontSize: '11px', color: m.tc, marginTop: '5px' }}>{m.trend}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--slate-400)', marginBottom: '14px', fontWeight: 500 }}>Geracao ultimas 7h</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '60px' }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: h + '%', background: i === 4 ? 'var(--green-400)' : 'rgba(77,179,87,0.4)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--slate-400)', marginBottom: '14px', fontWeight: 500 }}>Pipeline dMRV · {ts}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DMRV.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--slate-400)' }}>{s.label}</span>
                  <span style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', borderRadius: '100px', padding: '1px 10px', fontSize: '11px' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
