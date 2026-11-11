// frontend/app/admin/founder/page.js  (notun)
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const EMPTY = {
  name: '', title: '', quote: '', about: '', message: '', vision: '', mission: '',
  born: '', education: '', foundedYear: '', phone: '', email: '', facebook: '', website: '',
};
const BASIC = [['name', 'প্রতিষ্ঠাতার নাম *'], ['title', 'পদবী (যেমন: প্রতিষ্ঠাতা ও চেয়ারম্যান)'], ['born', 'জন্ম (তারিখ/স্থান)'], ['education', 'শিক্ষাগত যোগ্যতা'], ['foundedYear', 'মাদরাসা প্রতিষ্ঠার সাল']];
const CONTACT = [['phone', 'ফোন'], ['email', 'ইমেইল'], ['facebook', 'ফেসবুক লিংক'], ['website', 'ওয়েবসাইট লিংক']];
const TEXTS = [['quote', 'ছোট উক্তি (১-২ লাইন, প্রোফাইলে দেখাবে)', 2], ['about', 'জীবনী ও পরিচিতি', 9], ['message', 'প্রতিষ্ঠাতার বাণী', 6], ['vision', 'ভিশন', 4], ['mission', 'মিশন', 4]];

export default function AdminFounder() {
  const [d, setD] = useState(EMPTY);
  const [facts, setFacts] = useState([]);
  const [tl, setTl] = useState([]);
  const [img, setImg] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [rm, setRm] = useState(false);
  const [m, setM] = useState('');

  const fill = (r) => {
    setD({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, r?.[k] || ''])) });
    setFacts((r?.facts || []).map(({ label, value }) => ({ label, value })));
    setTl((r?.timeline || []).map(({ year, title, text }) => ({ year, title, text })));
    setImg(r?.image || '');
  };

  useEffect(() => { api('/founder', { auth: false }).then(fill).catch(() => {}); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(e) {
    const x = e.target.files[0] || null;
    setFile(x); setRm(false);
    setPreview(x ? URL.createObjectURL(x) : '');
  }

  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const upd = (arr, setArr, i, k, v) => setArr(arr.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const del = (arr, setArr, i) => setArr(arr.filter((_, j) => j !== i));

  async function save(e) {
    e.preventDefault();
    setM('');
    const fd = new FormData();
    Object.entries(d).forEach(([k, v]) => fd.append(k, v));
    fd.append('facts', JSON.stringify(facts));
    fd.append('timeline', JSON.stringify(tl));
    if (file) fd.append('image', file);
    else if (rm) fd.append('removeImage', '1');
    try {
      const r = await api('/founder', { method: 'PUT', body: fd });
      fill(r); setFile(null); setPreview(''); setRm(false);
      setM('সেভ হয়েছে');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x) { setM(x.message); }
  }

  const shown = preview || (rm ? '' : img);

  return (
    <>
      <h1>প্রতিষ্ঠাতা পরিচিতি</h1>
      <p className="muted">এখানে যা লিখবেন তা ওয়েবসাইটের "প্রতিষ্ঠাতা" পেজে দেখাবে। ফাঁকা রাখলে ওই অংশ দেখাবে না।</p>
      {m && <p className={m.includes('হয়েছে') ? 'ok' : 'err'}>{m}</p>}

      <form className="form fd-form" onSubmit={save}>
        <section className="fd-box">
          <h2>১. প্রাথমিক তথ্য</h2>
          <div className="fd-grid2">
            {BASIC.map(([k, l]) => (
              <label key={k}>{l}<input required={k === 'name'} value={d[k]} onChange={set(k)} /></label>
            ))}
          </div>
        </section>

        <section className="fd-box">
          <h2>২. ছবি</h2>
          {shown ? <img className="thumb big" src={shown} alt="" style={{ borderRadius: '50%', objectFit: 'cover' }} /> : <p className="muted">কোনো ছবি নেই (ডিফল্ট আইকন দেখাবে)</p>}
          <input type="file" accept="image/*" onChange={pick} />
          {img && !file && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={rm} onChange={(e) => setRm(e.target.checked)} />
              ছবি মুছে ফেলুন
            </label>
          )}
        </section>

        <section className="fd-box">
          <h2>৩. লেখা</h2>
          {TEXTS.map(([k, l, rows]) => (
            <label key={k}>{l}<textarea rows={rows} value={d[k]} onChange={set(k)} /></label>
          ))}
        </section>

        <section className="fd-box">
          <h2>৪. এক নজরে (অতিরিক্ত তথ্য)</h2>
          <p className="muted">যেমন: লেবেল "পিতার নাম", তথ্য "..." — যত খুশি যোগ করুন।</p>
          {facts.map((r, i) => (
            <div className="fd-row" key={i}>
              <input placeholder="লেবেল" value={r.label} onChange={(e) => upd(facts, setFacts, i, 'label', e.target.value)} />
              <input placeholder="তথ্য" value={r.value} onChange={(e) => upd(facts, setFacts, i, 'value', e.target.value)} />
              <button type="button" className="x" onClick={() => del(facts, setFacts, i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn sm" onClick={() => setFacts([...facts, { label: '', value: '' }])}>+ তথ্য যোগ করুন</button>
        </section>

        <section className="fd-box">
          <h2>৫. প্রতিষ্ঠার ইতিহাস / মাইলস্টোন</h2>
          {tl.map((r, i) => (
            <div className="fd-row tl" key={i}>
              <input placeholder="সাল" value={r.year} onChange={(e) => upd(tl, setTl, i, 'year', e.target.value)} />
              <input placeholder="শিরোনাম" value={r.title} onChange={(e) => upd(tl, setTl, i, 'title', e.target.value)} />
              <textarea rows="2" placeholder="বিবরণ" value={r.text} onChange={(e) => upd(tl, setTl, i, 'text', e.target.value)} />
              <button type="button" className="x" onClick={() => del(tl, setTl, i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn sm" onClick={() => setTl([...tl, { year: '', title: '', text: '' }])}>+ ঘটনা যোগ করুন</button>
        </section>

        <section className="fd-box">
          <h2>৬. যোগাযোগ</h2>
          <div className="fd-grid2">
            {CONTACT.map(([k, l]) => (
              <label key={k}>{l}<input value={d[k]} onChange={set(k)} /></label>
            ))}
          </div>
        </section>

        <div><button className="btn">সেভ করুন</button></div>
      </form>
    </>
  );
}