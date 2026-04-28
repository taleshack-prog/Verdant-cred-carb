'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';

const DEVICES = [
  { id: 'INV-WEG-001', type: 'WEG', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.3)', status: 'ok', conf: 99, last: '2 min atras' },
  { id: 'INV-FRONIUS-002', type: 'Fronius', color: '#5dcaa5', bg: 'rgba(93,202,165,0.08)', border: 'rgba(93,202,165,0.3)', status: 'ok', conf: 97, last: '5 min atras' },
  { id: 'INV-SUNGROW-003', type: 'Sungrow', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', status: 'err', conf: 71, last: '30 min atras' },
  { id: 'BIO-SENSOR-001', type: 'Biogas', color: '#6ed17a', bg: 'rgba(110,209,122,0.08)', border: 'rgba(110,209,122,0.3)', status: 'ok', conf: 94, last: '1 min atras' },
];

export default function AdminConsole() {
  const [user, setUser] = useState({ fullName: 'Admin', role: 'ADMIN' as const });
  useEffect(() => { const u = localStorage.getItem('verdant_user'); if (u) setUser(JSON.parse(u)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-950)' }}>
      <TopBar userName={user.fullName} role={user.role} />
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: 'white', margin: 0 }}>Dispositivos conectados</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--teal-300)', background: 'rgba(29,158,117,0.1)', border: '0.5px solid rgba(29,158,117,0.25)', borderRadius: '100px', padding: '4px 14px' }}>
            <span style={{ width: '5px', height: '5px', background: 'var(--teal-300)', borderRadius: '50%', display: 'inline-block' }} />
            Polygon · {DEVICES.length} ativos
          </div>
        </div>
        <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(77,179,87,0.07)', borderBottom: '0.5px solid rgba(77,179,87,0.12)' }}>
                {['Device ID', 'Tipo', 'Status', 'Confianca IA', 'Ultima leitura'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '10px', color: 'var(--green-400)', textAlign: 'left', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVICES.map((d, i) => {
                const cc = d.conf >= 90 ? 'var(--green-400)' : d.conf >= 75 ? '#f59e0b' : '#f87171';
                return (
                  <tr key={d.id} style={{ borderBottom: i < DEVICES.length - 1 ? '0.5px solid rgba(77,179,87,0.07)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--green-200)' }}>{d.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-block', fontSize: '10px', padding: '2px 10px', borderRadius: '100px', border: '0.5px solid ' + d.border, background: d.bg, color: d.color, fontWeight: 500 }}>{d.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '2px 10px', borderRadius: '100px', fontWeight: 500, ...(d.status === 'ok' ? { color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.25)' } : { color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.25)' }) }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: d.status === 'ok' ? '#4ade80' : '#f87171', display: 'inline-block' }} />
                        {d.status === 'ok' ? 'Online' : 'Erro'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ height: '4px', width: '70px', background: 'rgba(77,179,87,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: d.conf + '%', background: cc, borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: cc }}>{d.conf}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--slate-400)' }}>{d.last}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
