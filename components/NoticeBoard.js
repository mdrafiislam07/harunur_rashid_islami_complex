// frontend/components/NoticeBoard.js  (replace)
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

function Card({ n, feature }) {
  return (
    <Link href={`/notices?id=${n._id}`} className={'nb-card' + (feature ? ' feature' : '')}>
      <div className="nb-head">
        <div className="nb-date"><b>{n.day}</b><span>{n.mon}</span></div>
        <div className="nb-tags">
          <span className="nb-cat">{n.category}</span>
          {n.isNew && <span className="nb-new">নতুন</span>}
        </div>
      </div>
      <div className="nb-main">
        <h3>{n.title}</h3>
        {n.excerpt && <p>{n.excerpt}</p>}
      </div>
      <div className="nb-foot">
        <span>{n.full}</span>
        <b>বিস্তারিত দেখুন <i>→</i></b>
      </div>
    </Link>
  );
}

export default function NoticeBoard({ items }) {
  const [cat, setCat] = useState('সব');
  const [q, setQ] = useState('');

  const cats = useMemo(() => ['সব', ...new Set(items.map((i) => i.category))], [items]);
  const shown = items.filter(
    (i) =>
      (cat === 'সব' || i.category === cat) &&
      (!q.trim() || (i.title + ' ' + i.excerpt).toLowerCase().includes(q.trim().toLowerCase()))
  );
  const plain = cat !== 'সব' || q.trim();

  return (
    <>
      <div className="nb-toolbar">
        <div className="nb-chips">
          {cats.map((c) => (
            <button key={c} type="button" className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <input className="nb-search" type="search" placeholder="নোটিশ খুঁজুন..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {shown.length === 0 ? (
        <div className="nb-empty">
          <div>📭</div>
          <p>{items.length === 0 ? 'এখনো কোনো নোটিশ দেওয়া হয়নি।' : 'কোনো নোটিশ পাওয়া যায়নি।'}</p>
        </div>
      ) : (
        <div className="nb-grid">
          {shown.map((n, i) => <Card key={n._id} n={n} feature={!plain && i === 0 && shown.length > 1} />)}
        </div>
      )}
    </>
  );
}