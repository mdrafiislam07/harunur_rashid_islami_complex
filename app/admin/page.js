'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
export default function Dash() {
  const [s, setS] = useState(null); const [pw, setPw] = useState(''); const [m, setM] = useState('');
  useEffect(() => { api('/stats').then(setS).catch(() => {}); }, []);
  const cards = s ? [['ছাত্র-ছাত্রী', s.students, 'students'], ['শিক্ষক', s.teachers, 'teachers'], ['নোটিশ', s.notices, 'notices'], ['গ্যালারি ছবি', s.gallery, 'gallery'], ['নতুন ভর্তি আবেদন', s.pending, 'admissions']] : [];
  async function chg(e) { e.preventDefault(); try { await api('/auth/password', { method: 'POST', body: { password: pw } }); setM('পাসওয়ার্ড বদলানো হয়েছে'); setPw(''); } catch (x) { setM(x.message); } }
  return <><h1>ড্যাশবোর্ড</h1>
    <div className="stats">{cards.map(([l, n, h]) => <Link href={'/admin/' + h} className="stat" key={h}><b>{n}</b><span>{l}</span></Link>)}</div>
    <form className="form pwbox" onSubmit={chg}><h3>পাসওয়ার্ড পরিবর্তন</h3><label>নতুন পাসওয়ার্ড<input type="password" value={pw} onChange={e => setPw(e.target.value)} /></label>
      {m && <p className="ok">{m}</p>}<button className="btn sm">পরিবর্তন করুন</button></form></>;
}
