'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao criar conta');
      localStorage.setItem('verdant_token', data.accessToken);
      localStorage.setItem('verdant_user', JSON.stringify(data.user));
      document.cookie = `verdant_token=${data.accessToken};path=/;max-age=604800`;
      document.cookie = `verdant_role=${data.user.role};path=/;max-age=604800`;
      router.push('/producer');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'var(--green-800)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green-100)', outline: 'none', boxSizing: 'border-box' };
  const fields = [
    { k: 'fullName', label: 'Nome completo', type: 'text', ph: 'Joao da Silva' },
    { k: 'email', label: 'E-mail', type: 'email', ph: 'produtor@fazenda.com.br' },
    { k: 'password', label: 'Senha', type: 'password', ph: 'Minimo 8 caracteres' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--green-950)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ background: 'var(--green-900)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '380px', position: 'relative' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '28px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--green-500)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '0 10px 0 10px' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 500, color: 'white' }}>Verdant</span>
        </Link>
        <h1 style={{ fontSize: '16px', fontWeight: 500, color: 'white', margin: '0 0 4px' }}>Criar conta</h1>
        <p style={{ fontSize: '13px', color: 'var(--slate-400)', margin: '0 0 24px' }}>Comece a tokenizar seus ativos ambientais</p>
        <form onSubmit={handleRegister}>
          {fields.map(f => (
            <div key={f.k} style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>{f.label}</div>
              <input style={inp} type={f.type} placeholder={f.ph} value={(form as any)[f.k]} onChange={set(f.k)} required />
            </div>
          ))}
          {error && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: '6px', padding: '8px 12px' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--green-700)' : 'var(--green-500)', color: 'white', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '6px' }}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--slate-400)', marginTop: '20px' }}>
          Ja tem conta? <Link href="/login" style={{ color: 'var(--green-400)', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </main>
  );
}
