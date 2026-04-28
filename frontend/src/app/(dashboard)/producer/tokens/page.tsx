'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';

const TOKENS = [
  { id: 'VCC-001', amount: 0.0368, device: 'INV-WEG-001', type: 'WEG Solar', status: 'ACTIVE', hash: '0x7f8e9a2b3c4d5e6f', date: '28/04/2026', location: 'Fazenda Sao Joao', nasa: true, conf: 0.99, co2kg: 36.8 },
  { id: 'VCC-002', amount: 0.1240, device: 'INV-FRONIUS-002', type: 'Fronius Solar', status: 'ACTIVE', hash: '0x1a2b3c4d5e6f7a8b', date: '27/04/2026', location: 'Sitio Verde', nasa: true, conf: 0.97, co2kg: 124.0 },
  { id: 'VCC-003', amount: 0.8500, device: 'BIO-SENSOR-001', type: 'Biogas CH4', status: 'ACTIVE', hash: '0x9c8d7e6f5a4b3c2d', date: '26/04/2026', location: 'Granja Modelo', nasa: false, conf: 0.94, co2kg: 850.0 },
  { id: 'VCC-004', amount: 0.2100, device: 'INV-WEG-001', type: 'WEG Solar', status: 'SOLD', hash: '0x2e3f4a5b6c7d8e9f', date: '25/04/2026', location: 'Fazenda Sao Joao', nasa: true, conf: 0.98, co2kg: 210.0 },
  { id: 'VCC-005', amount: 0.0500, device: 'INV-FRONIUS-002', type: 'Fronius Solar', status: 'RETIRED', hash: '0x3f4a5b6c7d8e9f0a', date: '24/04/2026', location: 'Sitio Verde', nasa: true, conf: 0.96, co2kg: 50.0 },
];

const HISTORY = [
  { id: 'TX-001', type: 'MINT', amount: 0.0368, hash: '0x7f8e9a2b', date: '28/04/2026', detail: 'Pipeline dMRV Polygon' },
  { id: 'TX-002', type: 'MINT', amount: 0.1240, hash: '0x1a2b3c4d', date: '27/04/2026', detail: 'Pipeline dMRV Polygon' },
  { id: 'TX-003', type: 'MINT', amount: 0.8500, hash: '0x9c8d7e6f', date: '26/04/2026', detail: 'Pipeline dMRV Polygon' },
  { id: 'TX-004', type: 'SELL', amount: 0.2100, value: 20.59, hash: '0x2e3f4a5b', date: '25/04/2026', detail: 'Empresa XYZ Ltda' },
  { id: 'TX-005', type: 'RETIRE', amount: 0.0500, hash: '0x3f4a5b6c', date: '24/04/2026', detail: 'Compensacao ESG 2026' },
];

const ST: Record<string, {label:string;color:string;bg:string;border:string}> = {
  ACTIVE:  { label:'Ativo',      color:'#4ade80', bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.25)' },
  SOLD:    { label:'Vendido',    color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)' },
  RETIRED: { label:'Aposentado', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)' },
};

const TX: Record<string, {label:string;color:string}> = {
  MINT:   { label:'Emissao',    color:'#4ade80' },
  SELL:   { label:'Venda',      color:'#60a5fa' },
  RETIRE: { label:'Aposentado', color:'#f59e0b' },
};

export default function TokensPage() {
  const [user, setUser] = useState({ fullName: 'Produtor', role: 'PRODUCER' as const });
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<typeof TOKENS[0] | null>(null);
  const [tab, setTab] = useState<'tokens'|'history'>('tokens');

  useEffect(() => {
    const u = localStorage.getItem('verdant_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const filtered = TOKENS.filter(t => filter === 'ALL' || t.status === filter);
  const totalActive = TOKENS.filter(t => t.status === 'ACTIVE').reduce((s,t) => s+t.amount, 0);
  const g = (v: string) => 'var(--' + v + ')';

  return (
    <div style={{ minHeight:'100vh', background:g('green-950') }}>
      <TopBar userName={user.fullName} role={user.role} />
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'18px', fontWeight:500, color:'white', margin:'0 0 4px' }}>Meus tokens VCC</h1>
            <p style={{ fontSize:'13px', color:g('slate-400'), margin:0 }}>Verdant Carbon Credit · Polygon · 1 VCC = 1 tCO₂e</p>
          </div>
          <a href="/marketplace" style={{ background:g('green-500'), color:'white', borderRadius:'8px', padding:'9px 20px', fontSize:'13px', fontWeight:500, textDecoration:'none' }}>
            Vender no marketplace →
          </a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'20px' }}>
          {[
            { label:'Saldo ativo',    value:totalActive.toFixed(4),                              unit:'VCC', sub:'R$ '+(totalActive*98.50).toFixed(2), color:'#4ade80' },
            { label:'Total vendido',  value:TOKENS.filter(t=>t.status==='SOLD').reduce((s,t)=>s+t.amount,0).toFixed(4), unit:'VCC', sub:'Liquidado',    color:'#60a5fa' },
            { label:'Aposentado',     value:TOKENS.filter(t=>t.status==='RETIRED').reduce((s,t)=>s+t.amount,0).toFixed(4), unit:'VCC', sub:'ESG',       color:'#f59e0b' },
            { label:'Total emitido',  value:TOKENS.reduce((s,t)=>s+t.amount,0).toFixed(4),       unit:'VCC', sub:TOKENS.length+' tokens',               color:g('green-300') },
          ].map((c,i) => (
            <div key={i} style={{ background:g('green-900'), border:'0.5px solid rgba(77,179,87,0.15)', borderRadius:'10px', padding:'14px' }}>
              <div style={{ fontSize:'10px', color:g('slate-400'), marginBottom:'6px' }}>{c.label}</div>
              <div style={{ fontSize:'22px', fontWeight:500, color:'white' }}>{c.value}</div>
              <div style={{ fontSize:'10px', color:c.color, marginTop:'2px' }}>{c.unit}</div>
              <div style={{ fontSize:'11px', color:g('slate-400'), marginTop:'4px' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'4px', marginBottom:'16px', background:g('green-900'), borderRadius:'8px', padding:'4px', width:'fit-content' }}>
          {([['tokens','Tokens'],['history','Historico']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding:'6px 16px', fontSize:'12px', fontWeight:500, borderRadius:'6px', cursor:'pointer', border:'none', background:tab===id ? g('green-500') : 'transparent', color:tab===id ? 'white' : g('slate-400') }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'tokens' && (
          <div style={{ display:'grid', gridTemplateColumns:selected ? '1fr 340px' : '1fr', gap:'14px' }}>
            <div>
              <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                {['ALL','ACTIVE','SOLD','RETIRED'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ fontSize:'11px', padding:'4px 12px', borderRadius:'100px', cursor:'pointer', border:'0.5px solid', background:filter===f ? 'rgba(77,179,87,0.15)' : 'transparent', color:filter===f ? g('green-300') : g('slate-400'), borderColor:filter===f ? 'rgba(77,179,87,0.3)' : 'rgba(77,179,87,0.12)' }}>
                    {f === 'ALL' ? 'Todos' : ST[f]?.label}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {filtered.map(token => {
                  const st = ST[token.status];
                  const isSel = selected?.id === token.id;
                  return (
                    <div key={token.id} onClick={() => setSelected(isSel ? null : token)}
                      style={{ background:g('green-900'), border:'0.5px solid '+(isSel ? 'rgba(77,179,87,0.4)' : 'rgba(77,179,87,0.12)'), borderRadius:'10px', padding:'14px 16px', cursor:'pointer' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontSize:'12px', fontWeight:500, color:'white', fontFamily:'monospace' }}>{token.id}</span>
                          <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'100px', color:st.color, background:st.bg, border:'0.5px solid '+st.border }}>{st.label}</span>
                          {token.nasa && <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'100px', color:g('teal-300'), background:'rgba(29,158,117,0.1)', border:'0.5px solid rgba(29,158,117,0.25)' }}>NASA ✓</span>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:'16px', fontWeight:500, color:'white' }}>{token.amount.toFixed(4)}</div>
                          <div style={{ fontSize:'10px', color:g('green-400') }}>VCC · {token.co2kg.toFixed(0)}kg CO₂</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'16px', fontSize:'11px', color:g('slate-400') }}>
                        <span>{token.type}</span>
                        <span>{token.location}</span>
                        <span style={{ marginLeft:'auto' }}>Conf. {(token.conf*100).toFixed(0)}%</span>
                        <span>{token.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div style={{ background:g('green-900'), border:'0.5px solid rgba(77,179,87,0.2)', borderRadius:'10px', padding:'20px', height:'fit-content' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                  <span style={{ fontSize:'13px', fontWeight:500, color:'white' }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)} style={{ background:'transparent', border:'none', color:g('slate-400'), cursor:'pointer', fontSize:'18px' }}>×</button>
                </div>
                {[
                  ['Quantidade', selected.amount.toFixed(6)+' VCC'],
                  ['CO₂ equivalente', selected.co2kg.toFixed(1)+' kg CO₂e'],
                  ['Valor estimado', 'R$ '+(selected.amount*98.50).toFixed(2)],
                  ['Dispositivo', selected.device],
                  ['Tipo de fonte', selected.type],
                  ['Localizacao', selected.location],
                  ['Confianca IA', (selected.conf*100).toFixed(1)+'%'],
                  ['Validacao NASA', selected.nasa ? 'Confirmado' : 'Sensor fisico'],
                  ['Data de emissao', selected.date],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 0', borderBottom:'0.5px solid rgba(77,179,87,0.07)' }}>
                    <span style={{ color:g('slate-400') }}>{label}</span>
                    <span style={{ color:'white', fontWeight:500, textAlign:'right', maxWidth:'55%' }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop:'12px', marginBottom:'14px' }}>
                  <div style={{ fontSize:'10px', color:g('slate-400'), marginBottom:'5px' }}>TX Hash (Polygon)</div>
                  <div style={{ fontSize:'10px', fontFamily:'monospace', color:g('green-300'), background:g('green-800'), borderRadius:'6px', padding:'7px 10px', wordBreak:'break-all' }}>
                    {selected.hash}...
                  </div>
                </div>
                {selected.status === 'ACTIVE' && (
                  <div style={{ display:'flex', gap:'8px' }}>
                    <a href="/marketplace" style={{ flex:1, background:g('green-500'), color:'white', borderRadius:'6px', padding:'9px', fontSize:'12px', fontWeight:500, textDecoration:'none', textAlign:'center' }}>Vender</a>
                    <button style={{ flex:1, background:'rgba(245,158,11,0.1)', color:'#f59e0b', border:'0.5px solid rgba(245,158,11,0.25)', borderRadius:'6px', padding:'9px', fontSize:'12px', cursor:'pointer' }}>Aposentar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ background:g('green-900'), border:'0.5px solid rgba(77,179,87,0.15)', borderRadius:'10px', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'90px 1fr 110px 130px 90px', padding:'8px 16px', fontSize:'9px', color:g('slate-400'), letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'0.5px solid rgba(77,179,87,0.1)', background:'rgba(77,179,87,0.05)' }}>
              <span>Tipo</span><span>Detalhe</span><span>Quantidade</span><span>TX Hash</span><span>Data</span>
            </div>
            {HISTORY.map((tx, i) => (
              <div key={tx.id} style={{ display:'grid', gridTemplateColumns:'90px 1fr 110px 130px 90px', padding:'11px 16px', fontSize:'11px', borderBottom:i < HISTORY.length-1 ? '0.5px solid rgba(77,179,87,0.07)' : 'none', alignItems:'center' }}>
                <span style={{ color:TX[tx.type].color, fontWeight:500 }}>{TX[tx.type].label}</span>
                <span style={{ color:g('slate-400') }}>{tx.detail}</span>
                <span style={{ color:'white', fontWeight:500 }}>{tx.amount.toFixed(4)} VCC</span>
                <span style={{ fontFamily:'monospace', fontSize:'10px', color:g('green-300') }}>{tx.hash}...</span>
                <span style={{ color:g('slate-400'), fontSize:'10px' }}>{tx.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
