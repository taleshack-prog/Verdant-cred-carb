'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';

const ASKS = [
  { price: 98.50, qty: 10.0 },
  { price: 99.00, qty: 7.5 },
  { price: 99.50, qty: 4.2 },
  { price: 100.00, qty: 3.0 },
  { price: 100.50, qty: 1.5 },
];

const BIDS = [
  { price: 98.20, qty: 12.5 },
  { price: 97.80, qty: 8.2 },
  { price: 97.50, qty: 5.0 },
  { price: 97.20, qty: 3.8 },
  { price: 96.90, qty: 2.1 },
];

const TRADES = [
  { side: 'Compra', price: 98.50, qty: 2.0, time: '09:41:02' },
  { side: 'Venda',  price: 98.20, qty: 1.5, time: '09:40:31' },
  { side: 'Compra', price: 97.80, qty: 5.0, time: '09:39:55' },
  { side: 'Venda',  price: 97.50, qty: 0.8, time: '09:38:44' },
  { side: 'Compra', price: 98.00, qty: 3.2, time: '09:37:10' },
];

const BARS = [40,45,38,52,60,55,70,65,75,68,80,85,78,90,100];
const PRESETS = [0.5, 1.0, 5.0];

export default function Marketplace() {
  const [user, setUser] = useState({ fullName: 'Produtor', role: 'PRODUCER' as const });
  const [tab, setTab] = useState<'buy'|'sell'>('buy');
  const [price, setPrice] = useState('98.50');
  const [qty, setQty] = useState('1.000');
  const [orderType, setOrderType] = useState<'limit'|'market'>('limit');

  useEffect(() => {
    const u = localStorage.getItem('verdant_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const numPrice = parseFloat(price.replace(',', '.')) || 0;
  const numQty   = parseFloat(qty.replace(',', '.')) || 0;
  const subtotal = numPrice * numQty;
  const fee      = subtotal * 0.15;
  const total    = subtotal + fee;

  const g = (v: string) => `var(--${v})`;
  const card = { background: g('green-900'), border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', overflow: 'hidden' as const };
  const cardP = { ...card, padding: '14px' };

  return (
    <div style={{ minHeight: '100vh', background: g('green-950') }}>
      <TopBar userName={user.fullName} role={user.role} />

      <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', alignItems: 'start' }}>

        {/* ESQUERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {[
              { label: 'Preco VCC', value: 'R$ 98,50', unit: 'por tCO₂e', change: '↑ 3,2% hoje', cc: '#4ade80' },
              { label: 'Volume 24h', value: '1.847', unit: 'tokens negociados', change: '↑ 12% vs ontem', cc: '#4ade80' },
              { label: 'Ordens ativas', value: '234', unit: 'compra + venda', change: '128 compra · 106 venda', cc: g('slate-400') },
              { label: 'Meu saldo VCC', value: '0.0368', unit: '≈ R$ 3,62', change: 'Plano Semente · 15%', cc: '#facc15' },
            ].map((s, i) => (
              <div key={i} style={{ background: g('green-900'), border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: g('slate-400'), marginBottom: '5px' }}>{s.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: g('green-400'), marginTop: '2px' }}>{s.unit}</div>
                <div style={{ fontSize: '10px', color: s.cc, marginTop: '4px' }}>{s.change}</div>
              </div>
            ))}
          </div>

          {/* grafico */}
          <div style={cardP}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>VCC / BRL</span>
                <span style={{ fontSize: '20px', fontWeight: 500, color: 'white' }}>R$ 98,50</span>
                <span style={{ fontSize: '11px', color: '#4ade80' }}>+3,2%</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['1h','1d','7d','30d'].map(p => (
                  <span key={p} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '100px', color: p === '1d' ? g('green-300') : g('slate-400'), background: p === '1d' ? 'rgba(77,179,87,0.15)' : 'transparent' }}>{p}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '60px' }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: h + '%', background: i === BARS.length - 1 ? g('green-400') : `rgba(77,179,87,${0.25 + h/350})`, borderRadius: '1px 1px 0 0' }} />
              ))}
            </div>
          </div>

          {/* orderbook */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '0.5px solid rgba(77,179,87,0.1)' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'white' }}>Orderbook VCC/BRL</span>
              <span style={{ fontSize: '10px', color: g('teal-300'), background: 'rgba(29,158,117,0.1)', border: '0.5px solid rgba(29,158,117,0.25)', borderRadius: '100px', padding: '2px 8px' }}>Centralizado · Verdant</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(77,179,87,0.08)' }}>
              <div style={{ padding: '7px 14px', fontSize: '9px', color: g('slate-400'), letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 500 }}>Compras (BID)</div>
              <div style={{ padding: '7px 14px', fontSize: '9px', color: g('slate-400'), letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 500, textAlign: 'right' as const }}>Vendas (ASK)</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                {BIDS.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 14px', position: 'relative', fontSize: '11px' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: (b.qty / 15 * 100) + '%', background: 'rgba(74,222,128,0.07)' }} />
                    <span style={{ fontWeight: 500, color: '#4ade80', position: 'relative' }}>R$ {b.price.toFixed(2)}</span>
                    <span style={{ color: g('slate-400'), position: 'relative' }}>{b.qty.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <div>
                {ASKS.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 14px', position: 'relative', fontSize: '11px' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: (a.qty / 12 * 100) + '%', background: 'rgba(248,113,113,0.07)' }} />
                    <span style={{ color: g('slate-400'), position: 'relative' }}>{a.qty.toFixed(1)}</span>
                    <span style={{ fontWeight: 500, color: '#f87171', position: 'relative' }}>R$ {a.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderTop: '0.5px solid rgba(77,179,87,0.08)', fontSize: '10px', color: g('slate-400'), gap: '8px' }}>
              <span>Spread</span>
              <span style={{ color: '#facc15', fontWeight: 500 }}>R$ 0,30</span>
              <span>·</span>
              <span>Ultimo: <span style={{ color: 'white', fontWeight: 500 }}>R$ 98,50</span></span>
            </div>
          </div>

          {/* trades recentes */}
          <div style={card}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(77,179,87,0.1)', fontSize: '12px', fontWeight: 500, color: 'white' }}>Negociacoes recentes</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', padding: '7px 14px', fontSize: '9px', color: g('slate-400'), letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
              <span>Tipo</span><span>Preco</span><span>Qtd</span><span>Hora</span>
            </div>
            {TRADES.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', padding: '7px 14px', fontSize: '11px', borderTop: '0.5px solid rgba(77,179,87,0.06)', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, color: t.side === 'Compra' ? '#4ade80' : '#f87171' }}>{t.side}</span>
                <span style={{ color: 'white' }}>R$ {t.price.toFixed(2)}</span>
                <span style={{ color: g('slate-400') }}>{t.qty.toFixed(1)} VCC</span>
                <span style={{ color: g('slate-400'), fontSize: '10px' }}>{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DIREITA — form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={card}>
            {/* tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <button onClick={() => setTab('buy')} style={{ padding: '11px', fontSize: '12px', fontWeight: 500, textAlign: 'center' as const, cursor: 'pointer', border: 'none', background: tab === 'buy' ? 'rgba(74,222,128,0.1)' : 'transparent', color: tab === 'buy' ? '#4ade80' : 'rgba(248,113,113,0.5)', borderBottom: tab === 'buy' ? '2px solid #4ade80' : '0.5px solid rgba(77,179,87,0.1)' }}>
                Comprar VCC
              </button>
              <button onClick={() => setTab('sell')} style={{ padding: '11px', fontSize: '12px', fontWeight: 500, textAlign: 'center' as const, cursor: 'pointer', border: 'none', background: tab === 'sell' ? 'rgba(248,113,113,0.1)' : 'transparent', color: tab === 'sell' ? '#f87171' : 'rgba(74,222,128,0.4)', borderBottom: tab === 'sell' ? '2px solid #f87171' : '0.5px solid rgba(77,179,87,0.1)' }}>
                Vender VCC
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* tipo de ordem */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['limit','market'] as const).map(t => (
                  <button key={t} onClick={() => setOrderType(t)} style={{ flex: 1, padding: '6px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: '0.5px solid', fontWeight: 500, background: orderType === t ? 'rgba(77,179,87,0.15)' : 'transparent', color: orderType === t ? g('green-300') : g('slate-400'), borderColor: orderType === t ? 'rgba(77,179,87,0.3)' : 'rgba(77,179,87,0.1)' }}>
                    {t === 'limit' ? 'Limite' : 'Mercado'}
                  </button>
                ))}
              </div>

              {/* preco */}
              {orderType === 'limit' && (
                <div>
                  <div style={{ fontSize: '10px', color: g('slate-400'), marginBottom: '5px' }}>Preco por token</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: g('green-800'), border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '6px', padding: '8px 12px' }}>
                    <input value={price} onChange={e => setPrice(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: 'white', width: '100%' }} />
                    <span style={{ fontSize: '11px', color: g('green-400'), whiteSpace: 'nowrap' as const }}>BRL / VCC</span>
                  </div>
                </div>
              )}

              {/* quantidade */}
              <div>
                <div style={{ fontSize: '10px', color: g('slate-400'), marginBottom: '5px' }}>Quantidade</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: g('green-800'), border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '6px', padding: '8px 12px' }}>
                  <input value={qty} onChange={e => setQty(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, color: 'white', width: '100%' }} />
                  <span style={{ fontSize: '11px', color: g('green-400') }}>VCC</span>
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
                  {PRESETS.map(p => (
                    <button key={p} onClick={() => setQty(p.toFixed(3))} style={{ fontSize: '10px', color: g('green-300'), background: 'rgba(77,179,87,0.1)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '100px', padding: '2px 8px', cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setQty('0.0368')} style={{ fontSize: '10px', color: g('green-300'), background: 'rgba(77,179,87,0.1)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '100px', padding: '2px 8px', cursor: 'pointer' }}>Max</button>
                </div>
              </div>

              {/* resumo */}
              <div style={{ background: g('green-800'), borderRadius: '6px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { label: 'Subtotal', value: `R$ ${subtotal.toFixed(2)}`, color: 'white' },
                  { label: 'Taxa Verdant (15%)', value: `R$ ${fee.toFixed(2)}`, color: '#facc15' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: g('slate-400') }}>{r.label}</span>
                    <span style={{ color: r.color, fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '0.5px solid rgba(77,179,87,0.15)', paddingTop: '5px', marginTop: '3px' }}>
                  <span style={{ color: g('slate-400') }}>Total</span>
                  <span style={{ color: tab === 'buy' ? '#4ade80' : '#f87171', fontWeight: 500 }}>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button style={{ background: tab === 'buy' ? g('green-500') : '#991b1b', color: 'white', border: 'none', borderRadius: '6px', padding: '11px', width: '100%', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                {tab === 'buy' ? 'Confirmar compra' : 'Confirmar venda'}
              </button>
            </div>

            {/* saldo */}
            {[
              { label: 'Saldo disponivel', value: 'R$ 1.250,00' },
              { label: 'Tokens VCC', value: '0.0368 VCC' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderTop: '0.5px solid rgba(77,179,87,0.1)', fontSize: '11px' }}>
                <span style={{ color: g('slate-400') }}>{r.label}</span>
                <span style={{ color: g('green-300'), fontWeight: 500 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
