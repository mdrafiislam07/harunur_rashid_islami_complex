// frontend/app/admin/teachers/page.js
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES, sortTeachers } from '@/lib/teacherCategories';

const empty = { name: '', designation: '', subject: '', phone: '', bio: '', category: 'ustaz', order: 0 };

export default function AdminTeachers() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [oldImg, setOldImg] = useState('');
  const [m, setM] = useState('');

  const load = () => api('/teachers', { auth: false }).then((r) => setList(sortTeachers(r || [])));
  useEffect(() => { load(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(e) {
    const x = e.target.files[0] || null;
    setFile(x);
    setPreview(x ? URL.createObjectURL(x) : '');
  }

  function reset() {
    setF(empty); setEditId(null); setFile(null); setPreview(''); setOldImg('');
  }

  function edit(t) {
    setEditId(t._id);
    setF({
      name: t.name || '', designation: t.designation || '', subject: t.subject || '',
      phone: t.phone || '', bio: t.bio || '', category: t.category || 'ustaz', order: t.order ?? 0,
    });
    setOldImg(t.image || ''); setFile(null); setPreview(''); setM('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    setM('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (file) fd.append('image', file);
    try {
      await api(editId ? `/teachers/${editId}` : '/teachers', { method: editId ? 'PUT' : 'POST', body: fd });
      reset(); await load(); setM('সেভ হয়েছে');
    } catch (x) { setM(x.message); }
  }

  async function del(id) {
    if (!confirm('মুছে ফেলবেন?')) return;
    try { await api(`/teachers/${id}`, { method: 'DELETE' }); load(); } catch (x) { setM(x.message); }
  }

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const shown = preview || oldImg;

  return (
    <>
      <h1>শিক্ষক / টিম ম্যানেজ</h1>

      <form className="form" onSubmit={save}>
        <h3>{editId ? 'এডিট করুন' : 'নতুন যোগ করুন'}</h3>

        <label>ক্যাটাগরি (কোন সেকশনে দেখাবে)
          <select value={f.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
        <label>নাম *<input required value={f.name} onChange={set('name')} /></label>
        <label>পদবী (যেমন: প্রিন্সিপাল, উস্তায, সাপোর্ট এক্সিকিউটিভ)
          <input value={f.designation} onChange={set('designation')} />
        </label>
        <label>বিভাগ / বিষয় (ঐচ্ছিক, যেমন: তাজবীদ ডিপার্টমেন্ট)
          <input value={f.subject} onChange={set('subject')} />
        </label>
        <label>ফোন (ঐচ্ছিক)<input value={f.phone} onChange={set('phone')} /></label>
        <label>সিরিয়াল নম্বর (ছোট নম্বর আগে দেখাবে, যেমন 1, 2, 3)
          <input type="number" value={f.order} onChange={set('order')} />
        </label>
        <label>পরিচিতি / বায়ো
          <textarea rows="4" value={f.bio} onChange={set('bio')} />
        </label>
        <label>ছবি (না দিলে ডিফল্ট আইকন দেখাবে)
          {shown && <img className="thumb big" src={shown} alt="" style={{ borderRadius: '50%', objectFit: 'cover' }} />}
          <input type="file" accept="image/*" onChange={pick} />
        </label>

        {m && <p className="ok">{m}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn sm">{editId ? 'আপডেট করুন' : 'সেভ করুন'}</button>
          {editId && <button type="button" className="btn sm" onClick={reset}>বাতিল</button>}
        </div>
      </form>

      {CATEGORIES.map((c) => {
        const items = list.filter((t) => (t.category || 'ustaz') === c.key);
        if (!items.length) return null;
        return (
          <div key={c.key} style={{ marginTop: 28 }}>
            <h2>{c.label} ({items.length})</h2>
            <table className="table" style={{ width: '100%' }}>
              <thead><tr><th>#</th><th>ছবি</th><th>নাম</th><th>পদবী</th><th></th></tr></thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id}>
                    <td>{t.order ?? 0}</td>
                    <td>{t.image ? <img className="thumb" src={t.image} alt="" style={{ borderRadius: '50%' }} /> : '—'}</td>
                    <td>{t.name}</td>
                    <td>{t.designation}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn sm" onClick={() => edit(t)}>এডিট</button>{' '}
                      <button className="btn sm" onClick={() => del(t._id)}>ডিলিট</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}