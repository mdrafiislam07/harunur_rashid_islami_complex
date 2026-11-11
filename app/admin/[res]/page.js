'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES, catLabel, isFemale, sortTeachers } from '@/lib/teacherCategories';

const T = 'text', A = 'textarea', D = 'date', N = 'number', C = 'cat', K = 'check';

const CFG = {
  students: { title: 'ছাত্র-ছাত্রী', image: true, cols: ['name', 'className', 'roll', 'phone', 'status'], fields: [['name', 'নাম *', T], ['fatherName', 'পিতার নাম', T], ['roll', 'রোল', T], ['className', 'শ্রেণি', T], ['phone', 'ফোন', T], ['address', 'ঠিকানা', T], ['status', 'অবস্থা', 'select', ['active', 'passed', 'left']]] },
  teachers: {
    title: 'শিক্ষক', image: true,
    lbl: { category: 'ক্যাটাগরি', order: 'সিরিয়াল' },
    cols: ['order', 'category', 'name', 'designation', 'subject', 'phone'],
    fields: [
      ['category', 'ক্যাটাগরি / সেকশনের নাম * (নিজে লিখুন বা তালিকা থেকে বাছুন)', C],
      ['order', 'সিরিয়াল নম্বর (1, 2, 3... ছোট নম্বর আগে দেখাবে)', N],
      ['name', 'নাম *', T],
      ['designation', 'পদবি', T],
      ['subject', 'বিষয়', T],
      ['phone', 'ফোন', T],
      ['bio', 'পরিচিতি', A],
      ['female', 'মহিলা (ছবি না দিলে মহিলা আইকন দেখাবে)', K],
    ],
  },
  notices: { title: 'নোটিশ', cols: ['title', 'category', 'date'], fields: [['title', 'শিরোনাম *', T], ['category', 'ধরন', 'select', ['সাধারণ', 'পরীক্ষা', 'ভর্তি', 'ছুটি', 'ফলাফল']], ['date', 'তারিখ', D], ['body', 'বিস্তারিত', A]] },
  gallery: { title: 'গ্যালারি', image: true, cols: ['title'], fields: [['title', 'ছবির নাম', T]] },
  admissions: { title: 'ভর্তি আবেদন', noAdd: true, cols: ['name', 'fatherName', 'phone', 'className', 'status'], fields: [['name', 'নাম', T], ['fatherName', 'পিতার নাম', T], ['phone', 'ফোন', T], ['className', 'শ্রেণি', T], ['address', 'ঠিকানা', T], ['message', 'বার্তা', A], ['status', 'অবস্থা', 'select', ['pending', 'contacted', 'admitted', 'rejected']]] },
};
const LBL = { name: 'নাম', title: 'শিরোনাম', className: 'শ্রেণি', roll: 'রোল', phone: 'ফোন', status: 'অবস্থা', designation: 'পদবি', subject: 'বিষয়', category: 'ধরন', date: 'তারিখ', fatherName: 'পিতার নাম' };

export default function Manager({ params }) {
  const c = CFG[params.res]; if (!c) notFound();
  const isT = params.res === 'teachers';
  const [list, setList] = useState([]); const [form, setForm] = useState(null); const [file, setFile] = useState(null);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [q, setQ] = useState('');
  const load = () => api('/' + params.res).then(setList).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [params.res]);

  // teacher edit korar somoy purano key (ustaz etc.) ke Bengali naam e dekhabe
  const norm = (o) => isT
    ? { ...o, category: catLabel(o.category), order: o.order > 0 ? o.order : '', female: isFemale(o) }
    : o;
  const open = (o) => { setForm(o ? norm(o) : {}); setFile(null); setErr(''); };

  async function save(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const fd = new FormData();
    c.fields.forEach(([k, , t]) => {
      let v = form[k];
      if (t === N) v = v || 0;
      else if (t === K) v = !!v;
      else if (t === C) v = String(v || '').trim();
      fd.append(k, v ?? '');
    });
    if (file) fd.append('image', file);
    try { await api('/' + params.res + (form._id ? '/' + form._id : ''), { method: form._id ? 'PUT' : 'POST', body: fd }); setForm(null); load(); }
    catch (x) { setErr(x.message); } setBusy(false);
  }
  async function del(o) { if (!confirm('মুছে ফেলতে চান?')) return; await api('/' + params.res + '/' + o._id, { method: 'DELETE' }); load(); }

  // teachers: section onujayi, tarpor serial onujayi sajano
  const sorted = isT ? sortTeachers(list) : list;
  const shown = sorted.filter(o => JSON.stringify(o).toLowerCase().includes(q.toLowerCase()));
  const catOptions = isT ? [...new Set([...list.map(o => catLabel(o.category)), ...CATEGORIES.map(x => x.label)])] : [];

  const cell = (o, k) => {
    if (isT && k === 'category') return catLabel(o.category);
    if (isT && k === 'order') return o.order > 0 ? o.order : '—';
    return o[k] || '—';
  };

  return <>
    <div className="bar"><h1>{c.title} ({list.length})</h1>
      <input placeholder="খুঁজুন..." value={q} onChange={e => setQ(e.target.value)} />
      {!c.noAdd && <button className="btn sm" onClick={() => open()}>নতুন যোগ করুন</button>}</div>
    {err && !form && <p className="err">{err}</p>}
    <div className="tbl"><table><thead><tr>{c.image && <th>ছবি</th>}{c.cols.map(k => <th key={k}>{c.lbl?.[k] || LBL[k] || k}</th>)}<th></th></tr></thead>
      <tbody>{shown.map(o => <tr key={o._id}>{c.image && <td>{o.image ? <img className="thumb" src={o.image} alt="" /> : '—'}</td>}
        {c.cols.map(k => <td key={k}>{cell(o, k)}</td>)}
        <td className="acts"><button onClick={() => open(o)}>{c.noAdd ? 'দেখুন/আপডেট' : 'এডিট'}</button><button className="danger" onClick={() => del(o)}>ডিলিট</button></td></tr>)}
        {shown.length === 0 && <tr><td colSpan="9" className="muted">কিছু পাওয়া যায়নি।</td></tr>}</tbody></table></div>
    {form && <div className="modal" onClick={() => setForm(null)}><form className="form mbox" onClick={e => e.stopPropagation()} onSubmit={save}>
      <h2>{form._id ? 'আপডেট করুন' : 'নতুন যোগ করুন'}</h2>
      {c.fields.map(([k, l, t, o]) => t === K
        ? <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={!!form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} />{l}
          </label>
        : <label key={k}>{l}
          {t === 'textarea' ? <textarea rows="3" value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            : t === 'select' ? <select value={form[k] || o[0]} onChange={e => setForm({ ...form, [k]: e.target.value })}>{o.map(x => <option key={x}>{x}</option>)}</select>
            : t === C ? <>
                <input required list="cat-list" placeholder="যেমন: উস্তায" value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                <datalist id="cat-list">{catOptions.map(x => <option key={x} value={x} />)}</datalist>
              </>
            : <input type={t} min={t === N ? 1 : undefined} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />}</label>)}
      {c.image && <label>ছবি (Cloudinary-তে সেভ হবে){form.image && !file && <img className="thumb big" src={form.image} alt="" />}<input type="file" accept="image/*" required={params.res === 'gallery' && !form._id} onChange={e => setFile(e.target.files[0])} /></label>}
      {err && <p className="err">{err}</p>}
      <div className="row"><button className="btn sm" disabled={busy}>{busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button><button type="button" className="btn ghost sm" onClick={() => setForm(null)}>বাতিল</button></div></form></div>}
  </>;
}