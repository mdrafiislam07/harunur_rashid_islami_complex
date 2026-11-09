'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
export default function Login() {
  const r = useRouter(); const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState('');
  async function go(e) { e.preventDefault(); setErr('');
    try { const d = await api('/auth/login', { method: 'POST', body: f, auth: false }); localStorage.setItem('token', d.token); r.replace('/admin'); } catch (x) { setErr(x.message); } }
  return <div className="loginpg"><form className="form login" onSubmit={go}><h1>অ্যাডমিন লগইন</h1>
    <label>ইমেইল<input type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
    <label>পাসওয়ার্ড<input type="password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
    {err && <p className="err" role="alert">{err}</p>}<button className="btn">লগইন করুন</button></form></div>;
}
