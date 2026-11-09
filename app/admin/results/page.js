'use client';

import '@/app/portal.css';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { bn, subjectGrade, summarize } from '@/lib/grade';

const PRESET = ['কুরআন মাজীদ', 'আরবি', 'বাংলা', 'ইংরেজি', 'গণিত', 'ইসলামিয়াত'];

const blank = () => ({
  student: '',
  examName: '',
  year: String(new Date().getFullYear()),
  className: '',
  remarks: '',
  published: false,
  subjects: PRESET.map((name) => ({ name, full: 100, marks: '', absent: false })),
});

export default function Results() {
  const [students, setStudents] = useState([]);
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [f, setF] = useState(null);
  const [editId, setEditId] = useState(null);
  const [m, setM] = useState('');

  const load = () =>
    Promise.all([api('/students'), api('/results')])
      .then(([a, b]) => {
        setStudents(a);
        setList(b);
      })
      .catch((x) => setM(x.message));

  useEffect(() => { load(); }, []);

  const shown = list.filter((r) =>
    [r.student?.name, r.student?.roll, r.examName, r.year].join(' ').toLowerCase().includes(q.toLowerCase())
  );

  function openNew() {
    setEditId(null);
    setM('');
    setF(blank());
  }

  function openEdit(r) {
    setEditId(r._id);
    setM('');
    setF({
      student: r.student?._id || '',
      examName: r.examName || '',
      year: r.year || '',
      className: r.className || '',
      remarks: r.remarks || '',
      published: !!r.published,
      subjects: r.subjects.map((s) => ({ name: s.name, full: s.full, marks: s.marks, absent: s.absent })),
    });
  }

  const setSub = (i, patch) =>
    setF({ ...f, subjects: f.subjects.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  function pickStudent(id) {
    const st = students.find((s) => s._id === id);
    setF({ ...f, student: id, className: f.className || st?.className || '' });
  }

  async function save(e) {
    e.preventDefault();
    setM('');
    try {
      await api(editId ? `/results/${editId}` : '/results', {
        method: editId ? 'PUT' : 'POST',
        body: f,
      });
      setF(null);
      load();
    } catch (x) {
      setM(x.message);
    }
  }

  async function togglePublish(r) {
    try {
      await api(`/results/${r._id}`, {
        method: 'PUT',
        body: {
          examName: r.examName,
          year: r.year,
          className: r.className,
          remarks: r.remarks,
          subjects: r.subjects,
          published: !r.published,
        },
      });
      load();
    } catch (x) {
      setM(x.message);
    }
  }

  async function remove(r) {
    if (!confirm('এই ফলাফল মুছে ফেলবেন?')) return;
    try {
      await api(`/results/${r._id}`, { method: 'DELETE' });
      load();
    } catch (x) {
      setM(x.message);
    }
  }

  const sum = f ? summarize(f.subjects) : null;

  return (
    <>
      <div className="bar">
        <h1>পরীক্ষার ফলাফল</h1>
        <input placeholder="নাম / রোল / পরীক্ষা" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn sm" onClick={openNew}>+ নতুন ফলাফল</button>
      </div>

      {m && !f && <p className="err">{m}</p>}

      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>ছাত্র-ছাত্রী</th>
              <th>রোল</th>
              <th>পরীক্ষা</th>
              <th>GPA</th>
              <th>গ্রেড</th>
              <th>ফল</th>
              <th>প্রকাশ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name || <i>মুছে ফেলা</i>}</td>
                <td>{r.student?.roll}</td>
                <td>{r.examName} {r.year}</td>
                <td>{r.gpa?.toFixed(2)}</td>
                <td>{r.grade}</td>
                <td><span className={'badge ' + (r.passed ? 'pass' : 'fail')}>{r.passed ? 'পাস' : 'ফেল'}</span></td>
                <td><span className={'badge ' + (r.published ? 'pass' : 'draft')}>{r.published ? 'প্রকাশিত' : 'খসড়া'}</span></td>
                <td className="acts">
                  <button onClick={() => togglePublish(r)}>{r.published ? 'গোপন করুন' : 'প্রকাশ করুন'}</button>
                  <button onClick={() => openEdit(r)}>এডিট</button>
                  <button className="danger" onClick={() => remove(r)}>মুছুন</button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="8" className="muted">কোনো ফলাফল নেই।</td></tr>}
          </tbody>
        </table>
      </div>

      {f && (
        <div className="modal" onClick={() => setF(null)}>
          <div className="mbox wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'ফলাফল এডিট' : 'নতুন ফলাফল'}</h2>

            <form className="form" onSubmit={save}>
              <label>
                ছাত্র-ছাত্রী
                <select value={f.student} onChange={(e) => pickStudent(e.target.value)} required disabled={!!editId}>
                  <option value="">-- নির্বাচন করুন --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.roll ? `(রোল ${s.roll})` : ''} {s.className ? `— ${s.className}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <div className="row">
                <label style={{ flex: 2, minWidth: 180 }}>
                  পরীক্ষার নাম
                  <input value={f.examName} onChange={(e) => setF({ ...f, examName: e.target.value })} placeholder="যেমন: বার্ষিক পরীক্ষা" required />
                </label>
                <label style={{ flex: 1, minWidth: 100 }}>
                  সাল
                  <input value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} />
                </label>
                <label style={{ flex: 1, minWidth: 120 }}>
                  শ্রেণি
                  <input value={f.className} onChange={(e) => setF({ ...f, className: e.target.value })} />
                </label>
              </div>

              <div>
                <b>বিষয় ও নম্বর</b>
                <div style={{ marginTop: 8 }}>
                  {f.subjects.map((s, i) => {
                    const g = subjectGrade(s);
                    return (
                      <div className="subrow" key={i}>
                        <input placeholder="বিষয়" value={s.name} onChange={(e) => setSub(i, { name: e.target.value })} />
                        <input type="number" min="1" placeholder="পূর্ণমান" value={s.full} onChange={(e) => setSub(i, { full: e.target.value })} />
                        <input type="number" min="0" step="0.5" placeholder="প্রাপ্ত" value={s.marks} disabled={s.absent} onChange={(e) => setSub(i, { marks: e.target.value })} />
                        <label>
                          <input type="checkbox" style={{ width: 'auto' }} checked={s.absent} onChange={(e) => setSub(i, { absent: e.target.checked })} />
                          অনুপস্থিত
                        </label>
                        <span className="gr">{g.letter}</span>
                        <button type="button" className="x" onClick={() => setF({ ...f, subjects: f.subjects.filter((_, j) => j !== i) })}>✕</button>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="btn sm ghost" style={{ color: 'var(--mid)' }} onClick={() => setF({ ...f, subjects: [...f.subjects, { name: '', full: 100, marks: '', absent: false }] })}>
                  + বিষয় যোগ করুন
                </button>
              </div>

              {sum && (
                <div className="prev">
                  <span>মোট: <b>{bn(sum.totalMarks)}/{bn(sum.totalFull)}</b></span>
                  <span>শতকরা: <b>{bn(sum.percentage)}%</b></span>
                  <span>GPA: <b>{bn(sum.gpa.toFixed(2))}</b></span>
                  <span>গ্রেড: <b>{sum.grade}</b></span>
                  <span className={sum.passed ? 'ok' : 'err'}><b>{sum.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}</b></span>
                </div>
              )}

              <label>
                মন্তব্য (ঐচ্ছিক)
                <input value={f.remarks} onChange={(e) => setF({ ...f, remarks: e.target.value })} />
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} />
                ছাত্র-ছাত্রীর অ্যাকাউন্টে এখনই প্রকাশ করুন
              </label>

              {m && <p className="err">{m}</p>}

              <div className="row">
                <button className="btn sm">সেভ করুন</button>
                <button type="button" className="btn sm ghost" style={{ color: 'var(--mid)' }} onClick={() => setF(null)}>বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
