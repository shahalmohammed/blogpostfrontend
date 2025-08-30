const API_BASE = 'https://blogpostbackend-fqyz.onrender.com/api';

function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function publicApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const t = token();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}


