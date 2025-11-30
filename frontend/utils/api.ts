import Cookies from 'js-cookie';

const API_BASE = 'http://localhost:8080/api';
export const ASSET_BASE = 'http://localhost:8080';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('token');
  const headers: any = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store'
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}