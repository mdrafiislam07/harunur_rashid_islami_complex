'use client';
import { useEffect, useState } from 'react';
import { api, DEFAULT_LOGO } from '@/lib/api';

const F = [['name', 'মাদরাসার নাম'], ['tagline', 'ট্যাগলাইন'], ['phone', 'ফোন'], ['email', 'ইমেইল'], ['address', 'ঠিকানা']];

export default function Settings() {
  const [s, setS] = useState({});
  const [file, setFile] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [rmLogo, setRmLogo] = useState(false);
  const [m, setM] = useState('');

  useEffect(() => { api('/settings', { auth: false }).then(setS); }, []);
  useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview); }, [logoPreview]);

  function pickLogo(e) {
    const f = e.target.files[0] || null;
    setLogo(f);
    setRmLogo(false);
    setLogoPreview(f ? URL.createObjectURL(f) : '');
  }

  async function save(e) {
    e.preventDefault();
    setM('');
    const fd = new FormData();
    [...F.map((x) => x[0]), 'about'].forEach((k) => fd.append(k, s[k] || ''));
    if (file) fd.append('image', file);
    if (logo) fd.append('logo', logo);
    else if (rmLogo) fd.append('removeLogo', '1');
    try {
      setS(await api('/settings', { method: 'PUT', body: fd }));
      setFile(null);
      setLogo(null);
      setLogoPreview('');
      setRmLogo(false);
      setM('সেভ হয়েছে');
    } catch (x) { setM(x.message); }
  }

  const shownLogo = logoPreview || (rmLogo ? DEFAULT_LOGO : s.logo || DEFAULT_LOGO);
  const isCustom = !!s.logo && !rmLogo && !logo;

  return (
    <>
      <h1>সাইট সেটিং</h1>
      <form className="form" onSubmit={save}>
        {F.map(([k, l]) => (
          <label key={k}>{l}
            <input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
          </label>
        ))}
        <label>আমাদের পরিচয়
          <textarea rows="4" value={s.about || ''} onChange={(e) => setS({ ...s, about: e.target.value })} />
        </label>

        <label>লোগো (মেনু, ফুটার ও ব্রাউজার ট্যাবে দেখাবে)
          <img className="thumb big" src={shownLogo} alt="লোগো" style={{ borderRadius: '50%', background: '#fff', objectFit: 'contain' }} />
          <small className="muted">{isCustom || logo ? 'নিজের আপলোড করা লোগো' : 'ডিফল্ট লোগো'}</small>
          <input type="file" accept="image/*" onChange={pickLogo} />
        </label>
        {isCustom && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={rmLogo} onChange={(e) => setRmLogo(e.target.checked)} />
            নিজের লোগো মুছে ডিফল্ট লোগো ব্যবহার করুন
          </label>
        )}

        <label>হোমপেজের ছবি
          {s.image && !file && <img className="thumb big" src={s.image} alt="" />}
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        {m && <p className="ok">{m}</p>}
        <button className="btn sm">সেভ করুন</button>
      </form>
    </>
  );
}