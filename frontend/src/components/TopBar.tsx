'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopBarProps {
  userName?: string;
  role?: 'PRODUCER' | 'ADMIN';
}

export function TopBar({ userName = 'Usuario', role = 'PRODUCER' }: TopBarProps) {
  const pathname = usePathname();
  const links = role === 'ADMIN'
    ? [{ href: '/admin', label: 'Dispositivos' }, { href: '/admin/projects', label: 'Projetos' }]
    : [{ href: '/producer', label: 'Dashboard' }, { href: '/producer/tokens', label: 'Tokens' }];
  const initials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <nav style={{ background: 'var(--green-900)', borderBottom: '0.5px solid rgba(77,179,87,0.15)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--green-500)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '0 8px 0 8px' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'white' }}>Verdant</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: '12px', color: pathname === l.href ? 'var(--green-300)' : 'var(--slate-400)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(77,179,87,0.1)', border: '0.5px solid rgba(77,179,87,0.2)', borderRadius: '100px', padding: '4px 12px 4px 4px' }}>
        <div style={{ width: '20px', height: '20px', background: role === 'ADMIN' ? 'var(--teal-500)' : 'var(--green-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--green-100)', fontWeight: 500 }}>{initials}</div>
        <span style={{ fontSize: '12px', color: 'var(--green-300)' }}>{userName}</span>
      </div>
    </nav>
  );
}
