'use client';

import { useEffect, useState } from 'react';
import { studentApi, DEFAULT_LOGO, DEFAULT_SETTINGS } from '@/lib/api';
import { GRADE_SCALE, bn, subjectGrade } from '@/lib/grade';

function Sheet({ r, me, inst }) {
  return (
    <div className="sheet">
      <div className="shhead">
        <img src={inst.logo || DEFAULT_LOGO} alt="" />
        <h2>{inst.name || DEFAULT_SETTINGS.name}</h2>
        {inst.address && <p>{inst.address}</p>}
        <span className="shtitle">
          একাডেমিক ট্রান্সক্রিপ্ট — {r.examName}
          {r.year ? ` ${bn(r.year)}` : ''}
        </span>
      </div>

      <div className="shinfo">
        <div>নাম: <b>{me.name}</b></div>
        <div>রোল: <b>{bn(me.roll || '-')}</b></div>
        <div>পিতার নাম: <b>{me.fatherName || '-'}</b></div>
        <div>শ্রেণি: <b>{r.className || me.className || '-'}</b></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ক্রম</th>
            <th>বিষয়</th>
            <th>পূর্ণমান</th>
            <th>প্রাপ্ত নম্বর</th>
            <th>গ্রেড</th>
            <th>গ্রেড পয়েন্ট</th>
          </tr>
        </thead>
        <tbody>
          {r.subjects.map((s, i) => {
            const g = subjectGrade(s);
            return (
              <tr key={s._id || i}>
                <td>{bn(i + 1)}</td>
                <td className="l">{s.name}</td>
                <td>{bn(s.full)}</td>
                <td>{s.absent ? 'অনুপস্থিত' : bn(s.marks)}</td>
                <td>{g.letter}</td>
                <td>{bn(g.point.toFixed(2))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="shsum">
        <div><small>মোট নম্বর</small><b>{bn(r.totalMarks)} / {bn(r.totalFull)}</b></div>
        <div><small>শতকরা</small><b>{bn(r.percentage)}%</b></div>
        <div><small>GPA</small><b>{bn(r.gpa.toFixed(2))}</b></div>
        <div><small>গ্রেড</small><b>{r.grade}</b></div>
        <div className={r.passed ? '' : 'failv'}>
          <small>ফলাফল</small>
          <b>{r.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}</b>
        </div>
      </div>

      {r.remarks && <p><b>মন্তব্য:</b> {r.remarks}</p>}

      <div className="scale">
        <b>গ্রেডিং পদ্ধতি</b>
        <table>
          <thead>
            <tr><th>নম্বর (%)</th><th>গ্রেড</th><th>পয়েন্ট</th></tr>
          </thead>
          <tbody>
            {GRADE_SCALE.map(([a, b, c]) => (
              <tr key={b}><td>{a}</td><td>{b}</td><td>{c}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          প্রতিটি বিষয়ে কমপক্ষে ৩৩% নম্বর পেলে উত্তীর্ণ। কোনো বিষয়ে অনুত্তীর্ণ বা অনুপস্থিত হলে GPA ০.০০।
        </p>
      </div>

      <div className="sign">
        <span>শ্রেণি শিক্ষক</span>
        <span>অধ্যক্ষ / মুহতামিম</span>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const [me, setMe] = useState(null);
  const [results, setResults] = useState([]);
  const [notices, setNotices] = useState([]);
  const [inst, setInst] = useState({});
  const [selId, setSelId] = useState(null);
  const [pw, setPw] = useState('');
  const [m, setM] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([
      studentApi('/student-auth/me'),
      studentApi('/student-auth/results'),
      studentApi('/notices', { auth: false }).catch(() => []),
      studentApi('/settings', { auth: false }).catch(() => ({})),
    ])
      .then(([a, b, c, d]) => {
        setMe(a);
        setResults(b);
        setNotices(c);
        setInst(d);
        if (b[0]) setSelId(b[0]._id);
      })
      .catch((x) => setErr(x.message));
  }, []);

  async function changePw(e) {
    e.preventDefault();
    setM('');
    try {
      await studentApi('/student-auth/password', { method: 'POST', body: { password: pw } });
      setPw('');
      setM('পাসওয়ার্ড পরিবর্তন হয়েছে');
    } catch (x) {
      setM(x.message);
    }
  }

  if (err) return <p className="err">{err}</p>;
  if (!me) return <p className="muted">লোড হচ্ছে...</p>;

  const sel = results.find((x) => x._id === selId);

  return (
    <>
      <h1>স্বাগতম, {me.name}</h1>

      <section className="pcard profile">
        {me.image ? <img className="avatar" src={me.image} alt={me.name} /> : <div className="ph">{me.name?.[0]}</div>}
        <div className="kv">
          <div><small>নাম</small><b>{me.name}</b></div>
          <div><small>পিতার নাম</small><b>{me.fatherName || '-'}</b></div>
          <div><small>রোল</small><b>{bn(me.roll || '-')}</b></div>
          <div><small>শ্রেণি</small><b>{me.className || '-'}</b></div>
          <div><small>ফোন</small><b>{bn(me.phone || '-')}</b></div>
          <div><small>ঠিকানা</small><b>{me.address || '-'}</b></div>
          <div><small>ইউজারনেম</small><b>{me.username}</b></div>
          <div>
            <small>অবস্থা</small>
            <b>{me.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}</b>
          </div>
        </div>
      </section>

      <section className="pcard">
        <h2>পরীক্ষার ফলাফল</h2>

        {results.length === 0 && <p className="muted">এখনো কোনো ফলাফল প্রকাশ করা হয়নি।</p>}

        <div className="rlist">
          {results.map((x) => (
            <button
              key={x._id}
              className={'rbtn' + (x._id === selId ? ' on' : '')}
              onClick={() => setSelId(x._id)}
            >
              <span>
                <b>{x.examName}</b>
                {x.year ? ` — ${bn(x.year)}` : ''}
              </span>
              <span>
                GPA {bn(x.gpa.toFixed(2))} ({x.grade}){' '}
                <span className={'badge ' + (x.passed ? 'pass' : 'fail')}>
                  {x.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {sel && (
        <>
          <Sheet r={sel} me={me} inst={inst} />
          <p style={{ textAlign: 'center' }}>
            <button className="btn" onClick={() => window.print()}>মার্কশীট প্রিন্ট / PDF সেভ করুন</button>
          </p>
        </>
      )}

      <section className="pcard">
        <h2>সর্বশেষ নোটিশ</h2>
        {notices.length === 0 && <p className="muted">কোনো নোটিশ নেই।</p>}
        <ul className="nlist">
          {notices.slice(0, 6).map((n) => (
            <li key={n._id}>
              <time>{n.date}</time>
              <div>
                <b>{n.title}</b>
                <span className="tag">{n.category}</span>
                {n.body && <p className="muted" style={{ margin: '4px 0 0' }}>{n.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="pcard" style={{ maxWidth: 420 }}>
        <h2>পাসওয়ার্ড পরিবর্তন</h2>
        <form className="form" onSubmit={changePw}>
          <label>
            নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} required />
          </label>
          {m && <p className={m.includes('হয়েছে') ? 'ok' : 'err'}>{m}</p>}
          <button className="btn sm">পরিবর্তন করুন</button>
        </form>
      </section>
    </>
  );
}
