export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, auth = true } = {}, tokenKey = 'token') {
  const h = {};
  const t = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  if (auth && t) h.Authorization = 'Bearer ' + t;
  if (body && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const r = await fetch(API + path, { method, headers: h, body, cache: 'no-store' });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || 'কিছু একটা সমস্যা হয়েছে');
  return d;
}

// admin API (token = localStorage "token")
export const api = (path, opts) => request(path, opts, 'token');

// student API (token = localStorage "stoken")
export const studentApi = (path, opts) => request(path, opts, 'stoken');

// server-side public fetch (never throws)
export async function get(path, fallback = []) {
  try {
    const r = await fetch(API + path, { next: { revalidate: 30 } });
    return r.ok ? await r.json() : fallback;
  } catch {
    return fallback;
  }
}

export const DEFAULT_LOGO = '/madrasa.jpg';
export const DEFAULT_SETTINGS = {
  name: 'হারুনুর রশিদ ইসলামী কমপ্লেক্স',
  tagline: 'কুরআন ও সুন্নাহর আলোয় আলোকিত জীবন গড়ার প্রতিষ্ঠান',
  about: '',
  phone: '',
  email: '',
  address: '',
  logo: '',
};
