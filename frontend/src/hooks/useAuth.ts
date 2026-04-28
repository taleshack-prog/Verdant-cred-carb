'use client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem('verdant_token');
    localStorage.removeItem('verdant_user');
    document.cookie = 'verdant_token=;path=/;max-age=0';
    document.cookie = 'verdant_role=;path=/;max-age=0';
    router.push('/login');
  }

  function getUser() {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem('verdant_user');
    return u ? JSON.parse(u) : null;
  }

  return { logout, getUser };
}
