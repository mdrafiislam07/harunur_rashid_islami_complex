'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
export default function Admission() {
  const [f, setF] = useState({ name: '', fatherName: '', phone: '', className: '', address: '', message: '' });
  const [st, setSt] = useState({ type: '', msg: '' }); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setSt({ type: '', msg: '' });
    try { await api('/admissions', { method: 'POST', body: f, auth: false }); setSt({ type: 'ok', msg: 'আবেদন জমা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' }); setF({ name: '', fatherName: '', phone: '', className: '', address: '', message: '' }); }
    catch (er) { setSt({ type: 'err', msg: er.message }); } setBusy(false);
  }
  return <section className="sec"><div className="wrap narrow"><h1 className="ph1">অনলাইন ভর্তি আবেদন</h1>
    <form className="form" onSubmit={submit}>
      <label>শিক্ষার্থীর নাম *<input required value={f.name} onChange={set('name')} /></label>
      <label>পিতার নাম<input value={f.fatherName} onChange={set('fatherName')} /></label>
      <label>মোবাইল নম্বর *<input required value={f.phone} onChange={set('phone')} /></label>
      <label>ভর্তিচ্ছু শ্রেণি / বিভাগ<select value={f.className} onChange={set('className')}><option value="">বাছাই করুন</option><option>নূরানী</option><option>নাজেরা</option><option>হিফজ</option><option>কিতাব বিভাগ</option></select></label>
      <label>ঠিকানা<input value={f.address} onChange={set('address')} /></label>
      <label>অতিরিক্ত তথ্য<textarea rows="3" value={f.message} onChange={set('message')} /></label>
      {st.msg && <p className={st.type === 'ok' ? 'ok' : 'err'} role="status">{st.msg}</p>}
      <button className="btn" disabled={busy}>{busy ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}</button>
    </form></div></section>;
}
