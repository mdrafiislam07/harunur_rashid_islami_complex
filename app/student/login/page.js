'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { studentApi } from '@/lib/api';

export default function StudentLogin() {
  const r = useRouter();
  const [f, setF] = useState({ username: '', password: '' });
  const [m, setM] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setM('');
    setBusy(true);

    try {
      const d = await studentApi('/student-auth/login', {
        method: 'POST',
        body: f,
        auth: false,
      });
      localStorage.setItem('stoken', d.token);
      r.replace('/student');
    } catch (x) {
      setM(x.message);
    }

    setBusy(false);
  }

  return (
    <div className="loginpg">
      <form className="login form" onSubmit={submit}>
        <h1>স্টুডেন্ট লগইন</h1>

        <label>
          ইউজারনেম
          <input
            value={f.username}
            autoComplete="username"
            autoCapitalize="none"
            onChange={(e) => setF({ ...f, username: e.target.value })}
            required
          />
        </label>

        <label>
          পাসওয়ার্ড
          <input
            type="password"
            value={f.password}
            autoComplete="current-password"
            onChange={(e) => setF({ ...f, password: e.target.value })}
            required
          />
        </label>

        {m && <p className="err">{m}</p>}

        <button className="btn" disabled={busy}>
          {busy ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
        </button>

        <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>
          ইউজারনেম ও পাসওয়ার্ড মাদরাসা অফিস থেকে সংগ্রহ করুন।{' '}
          <Link href="/" style={{ color: 'var(--mid)', fontWeight: 600 }}>ওয়েবসাইটে ফিরুন</Link>
        </p>
      </form>
    </div>
  );
}
