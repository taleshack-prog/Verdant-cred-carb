'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao entrar');
      localStorage.setItem('verdant_token', data.accessToken);
      localStorage.setItem('verdant_user', JSON.stringify(data.user));
      document.cookie = `verdant_token=${data.accessToken};path=/;max-age=604800`;
      document.cookie = `verdant_role=${data.user.role};path=/;max-age=604800`;
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || (data.user.role === 'ADMIN' ? '/admin' : '/producer');
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'var(--green-800)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--green-100)', outline: 'none', boxSizing: 'border-box' };

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
        <h1 style={{ fontSize: '16px', fontWeight: 500, color: 'white', margin: '0 0 4px' }}>Bem-vindo de volta</h1>
        <p style={{ fontSize: '13px', color: 'var(--slate-400)', margin: '0 0 24px' }}>Acesse sua conta de produtor</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>E-mail</div>
            <input style={inp} type="email" placeholder="produtor@fazenda.com.br" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--slate-400)', marginBottom: '6px' }}>Senha</div>
            <input style={inp} type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: '6px', padding: '8px 12px' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'var(--green-700)' : 'var(--green-500)', color: 'white', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--slate-400)', marginTop: '20px' }}>
          Nao tem conta? <Link href="/register" style={{ color: 'var(--green-400)', textDecoration: 'none' }}>Criar conta</Link>
        </p>
      </div>
    </main>
  );
}
