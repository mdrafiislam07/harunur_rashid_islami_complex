'use client';

import '@/app/portal.css';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const gen = () => {
  const c = 'abcdefghjkmnpqrstuvwxyz23456789';
  const a = new Uint32Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => c[n % c.length]).join('');
};

export default function Accounts() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [f, setF] = useState({ username: '', password: '' });
  const [m, setM] = useState('');
  const [done, setDone] = useState(null);

  const load = () => api('/students').then(setList).catch((x) => setM(x.message));
  useEffect(() => { load(); }, []);

  const shown = list.filter((s) =>
    [s.name, s.roll, s.className, s.username].join(' ').toLowerCase().includes(q.toLowerCase())
  );

  function open(s) {
    setSel(s);
    setDone(null);
    setM('');
    setF({ username: s.username || (s.roll ? 'st' + s.roll : ''), password: gen() });
  }

  async function save(e) {
    e.preventDefault();
    setM('');
    try {
      const d = await api(`/students/${sel._id}/account`, { method: 'POST', body: f });
      setDone({ username: d.username, password: f.password });
      load();
    } catch (x) {
      setM(x.message);
    }
  }

  async function remove(s) {
    if (!confirm(`${s.name} এর অ্যাকাউন্ট মুছে ফেলবেন? সে আর লগইন করতে পারবে না।`)) return;
    try {
      await api(`/students/${s._id}/account`, { method: 'DELETE' });
      load();
    } catch (x) {
      setM(x.message);
    }
  }

  return (
    <>
      <div className="bar">
        <h1>স্টুডেন্ট অ্যাকাউন্ট</h1>
        <input placeholder="নাম / রোল / ক্লাস / ইউজারনেম" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {m && !sel && <p className="err">{m}</p>}

      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>নাম</th>
              <th>রোল</th>
              <th>শ্রেণি</th>
              <th>ইউজারনেম</th>
              <th>অ্যাকাউন্ট</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.roll}</td>
                <td>{s.className}</td>
                <td>{s.username || '-'}</td>
                <td>
                  <span className={'badge ' + (s.username ? 'pass' : 'draft')}>
                    {s.username ? 'আছে' : 'নেই'}
                  </span>
                </td>
                <td className="acts">
                  <button onClick={() => open(s)}>{s.username ? 'পাসওয়ার্ড রিসেট' : 'অ্যাকাউন্ট তৈরি'}</button>
                  {s.username && <button className="danger" onClick={() => remove(s)}>মুছুন</button>}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan="6" className="muted">কোনো ছাত্র-ছাত্রী পাওয়া যায়নি। আগে "ছাত্র-ছাত্রী" পেজ থেকে যোগ করুন।</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="modal" onClick={() => setSel(null)}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <h2>{sel.name} — লগইন অ্যাকাউন্ট</h2>

            {!done ? (
              <form className="form" onSubmit={save}>
                <label>
                  ইউজারনেম
                  <input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
                </label>
                <label>
                  পাসওয়ার্ড
                  <input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} minLength={6} required />
                </label>
                <div className="row">
                  <button type="button" className="btn sm ghost" style={{ color: 'var(--mid)' }} onClick={() => setF({ ...f, password: gen() })}>
                    নতুন পাসওয়ার্ড বানান
                  </button>
                </div>
                {m && <p className="err">{m}</p>}
                <div className="row">
                  <button className="btn sm">সেভ করুন</button>
                  <button type="button" className="btn sm ghost" style={{ color: 'var(--mid)' }} onClick={() => setSel(null)}>বাতিল</button>
                </div>
              </form>
            ) : (
              <>
                <p className="ok">অ্যাকাউন্ট তৈরি হয়েছে। এই তথ্য ছাত্র/অভিভাবককে দিন। পাসওয়ার্ড পরে আর দেখা যাবে না।</p>
                <div className="cred">
                  লগইন: {typeof window !== 'undefined' ? window.location.origin : ''}/student/login<br />
                  ইউজারনেম: {done.username}<br />
                  পাসওয়ার্ড: {done.password}
                </div>
                <p><button className="btn sm" onClick={() => setSel(null)}>বন্ধ করুন</button></p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
