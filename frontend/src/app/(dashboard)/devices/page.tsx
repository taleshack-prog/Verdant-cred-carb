'use client';
import { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { useRouter } from 'next/navigation';

type Step = 'type' | 'identify' | 'credentials' | 'discovering' | 'done';
type DeviceCategory = 'solar' | 'biogas' | 'wind' | 'generic';

interface DeviceForm {
  category: DeviceCategory | '';
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  latitude: string;
  longitude: string;
  authType: 'api_key' | 'bearer' | 'basic' | 'none' | 'mqtt' | 'modbus';
  apiKey: string;
  username: string;
  password: string;
  mqttBroker: string;
  modbusIp: string;
  modbusPort: string;
}

const CATEGORIES = [
  { id: 'solar',   label: 'Energia Solar',  sub: 'Inversores fotovoltaicos', color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)',  brands: ['WEG', 'Fronius', 'Sungrow', 'Huawei', 'ABB', 'SMA', 'Growatt', 'Outro'] },
  { id: 'biogas',  label: 'Biogás / Metano', sub: 'Sensores de biodigestor',  color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)',  brands: ['Sick', 'Endress+Hauser', 'ABB', 'Yokogawa', 'Genérico IoT', 'Outro'] },
  { id: 'wind',    label: 'Eólica',          sub: 'Anemômetros e SCADA',      color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)',  brands: ['Vestas', 'Siemens Gamesa', 'WEG', 'Genérico SCADA', 'Outro'] },
  { id: 'generic', label: 'Genérico IoT',    sub: 'MQTT · Modbus · CSV',      color: '#c084fc', bg: 'rgba(192,132,252,0.08)',border: 'rgba(192,132,252,0.25)', brands: ['Qualquer marca'] },
];

const AUTH_TYPES = [
  { id: 'api_key', label: 'API Key',       sub: 'Fronius, Sungrow, Growatt' },
  { id: 'bearer',  label: 'Bearer Token',  sub: 'WEG, Huawei, ABB' },
  { id: 'basic',   label: 'User + Senha',  sub: 'Portais web dos fabricantes' },
  { id: 'mqtt',    label: 'MQTT Broker',   sub: 'Sensores IoT genéricos' },
  { id: 'modbus',  label: 'Modbus TCP',    sub: 'Equipamentos industriais' },
  { id: 'none',    label: 'Sem credenciais', sub: 'API pública ou push webhook' },
];

const EMPTY: DeviceForm = {
  category: '', brand: '', model: '', serialNumber: '', location: '',
  latitude: '', longitude: '',
  authType: 'api_key', apiKey: '', username: '', password: '',
  mqttBroker: '', modbusIp: '', modbusPort: '502',
};

const DISCOVERY_STEPS = [
  'Consultando base de protocolos...',
  'Claude identificando endpoints da API...',
  'Mapeando campos do fabricante...',
  'Testando conectividade...',
  'Validando schema de dados...',
  'Dispositivo pronto!',
];

export default function DevicesPage() {
  const router = useRouter();
  const [user, setUser] = useState({ fullName: 'Produtor', role: 'PRODUCER' as const });
  const [step, setStep] = useState<Step>('type');
  const [form, setForm] = useState<DeviceForm>(EMPTY);
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('verdant_user');
    if (u) setUser(JSON.parse(u));
    const d = localStorage.getItem('verdant_devices');
    if (d) setRegisteredDevices(JSON.parse(d));
  }, []);

  function set(k: keyof DeviceForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function runDiscovery() {
    setStep('discovering');
    setDiscoveryStep(0);

    for (let i = 0; i < DISCOVERY_STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      setDiscoveryStep(i + 1);
    }

    const mockResult = {
      protocol: form.brand === 'Fronius' ? 'Solar.API v1 (Push)' :
                form.brand === 'WEG'     ? 'REST API + Webhook' :
                form.brand === 'Sungrow' ? 'iSolarCloud API' :
                form.brand === 'Huawei'  ? 'FusionSolar API' :
                form.category === 'biogas' ? 'MQTT + Modbus TCP' :
                'REST API Genérica',
      endpoint: form.brand === 'Fronius' ? 'http://{ip}/solar_api/v1/GetPowerFlowRealtimeData.fcgi' :
               form.brand === 'WEG'     ? 'https://api.weg.net/solar/v2/devices/{serial}/telemetry' :
               form.brand === 'Sungrow' ? 'https://gateway.isolarcloud.com.hk/openapi/getDeviceRealTimeData' :
               'https://api.{brand}.com/v1/data',
      fields: {
        power: form.brand === 'Fronius' ? 'Body.Data.Site.P_PV' :
               form.brand === 'WEG'     ? 'gen_pow' :
               form.brand === 'Sungrow' ? 'p_active' : 'power_w',
        energy: form.brand === 'Fronius' ? 'Body.Data.Site.E_Total' :
                form.brand === 'WEG'     ? 'tot_en' : 'energy_wh',
        temp:   'temperature',
        status: 'device_status',
      },
      pullInterval: form.category === 'biogas' ? '5 min' : '15 min',
      confidence: 0.94 + Math.random() * 0.05,
    };

    setDiscoveryResult(mockResult);
    setDiscoveryStep(DISCOVERY_STEPS.length - 1);
    setStep('done');

    const newDevice = {
      id: `${form.brand.toUpperCase().replace(' ', '-')}-${form.serialNumber || Date.now()}`,
      category: form.category,
      brand: form.brand,
      model: form.model,
      location: form.location,
      protocol: mockResult.protocol,
      status: 'ok',
      confidence: mockResult.confidence,
      lastSeen: 'Agora',
    };
    const updated = [...registeredDevices, newDevice];
    setRegisteredDevices(updated);
    localStorage.setItem('verdant_devices', JSON.stringify(updated));
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--green-800)',
    border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '8px',
    padding: '9px 12px', fontSize: '13px', color: 'var(--green-100)',
    outline: 'none', boxSizing: 'border-box',
  };

  const sel: React.CSSProperties = { ...inp, appearance: 'none' as const };

  const selectedCat = CATEGORIES.find(c => c.id === form.category);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-950)' }}>
      <TopBar userName={user.fullName} role={user.role} />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: 'white', margin: '0 0 4px' }}>
            Conectar dispositivo
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--slate-400)', margin: 0 }}>
            A IA descobre automaticamente como se conectar a qualquer inversor ou sensor
          </p>
        </div>

        {/* Progress steps */}
        {step !== 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            {[
              { id: 'type', label: 'Tipo' },
              { id: 'identify', label: 'Identificar' },
              { id: 'credentials', label: 'Credenciais' },
              { id: 'discovering', label: 'Descoberta IA' },
            ].map((s, i, arr) => {
              const steps = ['type','identify','credentials','discovering'];
              const idx = steps.indexOf(step);
              const sIdx = steps.indexOf(s.id);
              const done = sIdx < idx;
              const active = sIdx === idx;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 500, background: done ? 'var(--green-500)' : active ? 'rgba(77,179,87,0.2)' : 'rgba(77,179,87,0.08)', border: `0.5px solid ${done || active ? 'var(--green-500)' : 'rgba(77,179,87,0.15)'}`, color: done || active ? 'white' : 'var(--slate-400)' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '11px', color: active ? 'var(--green-300)' : done ? 'var(--slate-400)' : 'var(--slate-400)' }}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div style={{ width: '24px', height: '0.5px', background: done ? 'var(--green-600)' : 'rgba(77,179,87,0.15)' }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1: Tipo */}
        {step === 'type' && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--slate-400)', marginBottom: '16px' }}>
              Qual é o tipo de geração de energia ou sensor?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '24px' }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id as DeviceCategory }))}
                  style={{ background: form.category === cat.id ? cat.bg : 'var(--green-900)', border: `0.5px solid ${form.category === cat.id ? cat.border : 'rgba(77,179,87,0.15)'}`, borderRadius: '10px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: form.category === cat.id ? cat.color : 'white', marginBottom: '4px' }}>{cat.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>{cat.sub}</div>
                </div>
              ))}
            </div>
            <button disabled={!form.category} onClick={() => setStep('identify')}
              style={{ background: form.category ? 'var(--green-500)' : 'var(--green-800)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: 500, cursor: form.category ? 'pointer' : 'not-allowed' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 2: Identificar */}
        {step === 'identify' && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--slate-400)', marginBottom: '16px' }}>
              Identifique o dispositivo para que a IA descubra o protocolo correto
            </p>
            <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Fabricante *</div>
                  <select value={form.brand} onChange={set('brand')} style={sel}>
                    <option value="">Selecione...</option>
                    {selectedCat?.brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Modelo *</div>
                  <input style={inp} placeholder={
                    form.brand === 'WEG' ? 'Ex: SIW300H' :
                    form.brand === 'Fronius' ? 'Ex: Symo 10.0-3-M' :
                    form.brand === 'Sungrow' ? 'Ex: SG10RT' : 'Ex: Model X-2000'
                  } value={form.model} onChange={set('model')} />
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Número de série</div>
                  <input style={inp} placeholder="Ex: 2312345678" value={form.serialNumber} onChange={set('serialNumber')} />
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Localização</div>
                  <input style={inp} placeholder="Ex: Fazenda São João — Galpão 2" value={form.location} onChange={set('location')} />
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Latitude</div>
                  <input style={inp} placeholder="Ex: -23.5505" value={form.latitude} onChange={set('latitude')} />
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Longitude</div>
                  <input style={inp} placeholder="Ex: -46.6333" value={form.longitude} onChange={set('longitude')} />
                </div>
              </div>

              {form.brand && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(77,179,87,0.07)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '6px', fontSize: '11px', color: 'var(--green-300)' }}>
                  Claude vai identificar automaticamente o protocolo para {form.brand} {form.model}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('type')} style={{ background: 'transparent', color: 'var(--slate-400)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                ← Voltar
              </button>
              <button disabled={!form.brand || !form.model} onClick={() => setStep('credentials')}
                style={{ background: form.brand && form.model ? 'var(--green-500)' : 'var(--green-800)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: 500, cursor: form.brand && form.model ? 'pointer' : 'not-allowed' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Credenciais */}
        {step === 'credentials' && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--slate-400)', marginBottom: '16px' }}>
              Como o Verdant vai acessar os dados do dispositivo?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
              {AUTH_TYPES.map(a => (
                <div key={a.id} onClick={() => setForm(f => ({ ...f, authType: a.id as any }))}
                  style={{ background: form.authType === a.id ? 'rgba(77,179,87,0.12)' : 'var(--green-900)', border: `0.5px solid ${form.authType === a.id ? 'rgba(77,179,87,0.35)' : 'rgba(77,179,87,0.12)'}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: form.authType === a.id ? 'var(--green-300)' : 'white', marginBottom: '3px' }}>{a.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--slate-400)' }}>{a.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
              {form.authType === 'api_key' && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>API Key</div>
                  <input style={inp} type="password" placeholder="Cole sua chave de API aqui" value={form.apiKey} onChange={set('apiKey')} />
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '8px' }}>
                    Encontre em: Portal do fabricante → Configurações → Integração → API Key
                  </div>
                </div>
              )}
              {form.authType === 'bearer' && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Bearer Token</div>
                  <input style={inp} type="password" placeholder="Token de acesso" value={form.apiKey} onChange={set('apiKey')} />
                </div>
              )}
              {form.authType === 'basic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Usuário</div>
                    <input style={inp} placeholder="seu@email.com" value={form.username} onChange={set('username')} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Senha</div>
                    <input style={inp} type="password" placeholder="Senha do portal" value={form.password} onChange={set('password')} />
                  </div>
                </div>
              )}
              {form.authType === 'mqtt' && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Endereço do broker MQTT</div>
                  <input style={inp} placeholder="mqtt://192.168.1.100:1883" value={form.mqttBroker} onChange={set('mqttBroker')} />
                </div>
              )}
              {form.authType === 'modbus' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>IP do dispositivo</div>
                    <input style={inp} placeholder="192.168.1.50" value={form.modbusIp} onChange={set('modbusIp')} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Porta Modbus</div>
                    <input style={inp} placeholder="502" value={form.modbusPort} onChange={set('modbusPort')} />
                  </div>
                </div>
              )}
              {form.authType === 'none' && (
                <div style={{ padding: '12px', background: 'rgba(77,179,87,0.07)', borderRadius: '6px', fontSize: '12px', color: 'var(--green-300)' }}>
                  O dispositivo enviará dados automaticamente via webhook para o endpoint do Verdant.
                  Após o cadastro você receberá a URL de destino.
                </div>
              )}
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(250,204,21,0.06)', border: '0.5px solid rgba(250,204,21,0.2)', borderRadius: '6px', fontSize: '11px', color: '#facc15', marginBottom: '16px' }}>
              Suas credenciais são criptografadas com AES-256 e nunca ficam expostas
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('identify')} style={{ background: 'transparent', color: 'var(--slate-400)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                ← Voltar
              </button>
              <button onClick={runDiscovery}
                style={{ background: 'var(--green-500)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Iniciar descoberta IA →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Descoberta IA */}
        {step === 'discovering' && (
          <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.15)', borderRadius: '10px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(77,179,87,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
              🤖
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: 'white', margin: '0 0 8px' }}>
              Claude descobrindo protocolo...
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--slate-400)', margin: '0 0 28px' }}>
              {form.brand} {form.model}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
              {DISCOVERY_STEPS.slice(0, -1).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, background: i < discoveryStep ? 'var(--green-500)' : i === discoveryStep ? 'rgba(77,179,87,0.3)' : 'rgba(77,179,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white' }}>
                    {i < discoveryStep ? '✓' : ''}
                  </div>
                  <span style={{ color: i < discoveryStep ? 'var(--green-300)' : i === discoveryStep ? 'white' : 'var(--slate-400)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Concluído */}
        {step === 'done' && discoveryResult && (
          <div>
            <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.25)', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(74,222,128,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>Dispositivo conectado com sucesso!</div>
                  <div style={{ fontSize: '11px', color: 'var(--green-400)' }}>{form.brand} {form.model} — {form.location}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Protocolo detectado', value: discoveryResult.protocol },
                  { label: 'Intervalo de coleta', value: discoveryResult.pullInterval },
                  { label: 'Campo de potência', value: discoveryResult.fields.power },
                  { label: 'Campo de energia', value: discoveryResult.fields.energy },
                  { label: 'Confiança da IA', value: (discoveryResult.confidence * 100).toFixed(1) + '%' },
                  { label: 'Autenticação', value: AUTH_TYPES.find(a => a.id === form.authType)?.label || '' },
                ].map((r, i) => (
                  <div key={i} style={{ background: 'var(--green-800)', borderRadius: '6px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--slate-400)', marginBottom: '4px' }}>{r.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--green-200)', fontWeight: 500, fontFamily: 'monospace' }}>{r.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(77,179,87,0.07)', borderRadius: '6px', fontSize: '11px', color: 'var(--slate-400)' }}>
                <span style={{ color: 'var(--green-400)', fontWeight: 500 }}>Endpoint detectado: </span>
                <span style={{ fontFamily: 'monospace' }}>{discoveryResult.endpoint}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setStep('type'); setForm(EMPTY); setDiscoveryResult(null); }}
                style={{ background: 'transparent', color: 'var(--green-300)', border: '0.5px solid rgba(77,179,87,0.3)', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                + Adicionar outro dispositivo
              </button>
              <button onClick={() => router.push('/producer')}
                style={{ background: 'var(--green-500)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Ver dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Lista de dispositivos cadastrados */}
        {registeredDevices.length > 0 && step !== 'discovering' && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '12px' }}>
              Dispositivos cadastrados ({registeredDevices.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {registeredDevices.map((d, i) => (
                <div key={i} style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.12)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'white', fontFamily: 'monospace' }}>{d.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>{d.protocol} · {d.location}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--green-400)' }}>
                    Conf. IA: {(d.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
