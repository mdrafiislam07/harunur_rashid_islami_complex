// frontend/components/GalleryGrid.js  (replace)
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const PER_PAGE = 24; // desktop: 4 x 6 | phone: 2 x 12
const bn = (n) => new Intl.NumberFormat('bn-BD').format(n);

function pageNums(cur, total) {
  const nums = [...new Set([1, total, cur - 1, cur, cur + 1])].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…' + n);
    out.push(n);
  });
  return out;
}

export default function GalleryGrid({ items }) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(-1); // lightbox: global index, -1 = bondho
  const topRef = useRef(null);

  const total = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const slice = items.slice(start, start + PER_PAGE);

  const go = (p) => {
    const n = Math.min(total, Math.max(1, p));
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const close = useCallback(() => setOpen(-1), []);
  const next = useCallback(() => setOpen((i) => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setOpen((i) => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = old;
    };
  }, [open, close, next, prev]);

  if (items.length === 0) {
    return (
      <div className="nb-empty">
        <div>🖼️</div>
        <p>গ্যালারিতে এখনো কোনো ছবি যোগ করা হয়নি।</p>
      </div>
    );
  }

  const cur = open >= 0 ? items[open] : null;

  return (
    <>
      <div ref={topRef} className="gl-top" />
      <div className="gl-count">মোট ছবি <b>{bn(items.length)}</b></div>

      <div className="gl-grid">
        {slice.map((g, i) => (
          <button key={g._id} type="button" className="gl-item" onClick={() => setOpen(start + i)} aria-label={g.title || 'ছবি দেখুন'}>
            <img src={g.image} alt={g.title || ''} loading="lazy" />
            <span className="gl-cap">
              <strong>{g.title}</strong>
              <span className="gl-zoom">⤢</span>
            </span>
          </button>
        ))}
      </div>

      {total > 1 && (
        <nav className="gl-pager" aria-label="পৃষ্ঠা">
          <button type="button" onClick={() => go(page - 1)} disabled={page === 1}>
            ‹<span className="gl-lbl"> আগের</span>
          </button>
          {pageNums(page, total).map((n) =>
            typeof n === 'string' ? (
              <span key={n} className="gl-dots">…</span>
            ) : (
              <button key={n} type="button" className={n === page ? 'on' : ''} onClick={() => go(n)} aria-current={n === page ? 'page' : undefined}>
                {bn(n)}
              </button>
            )
          )}
          <button type="button" onClick={() => go(page + 1)} disabled={page === total}>
            <span className="gl-lbl">পরের </span>›
          </button>
        </nav>
      )}
      {total > 1 && (
        <p className="gl-info">
          {bn(start + 1)}–{bn(start + slice.length)} টি ছবি, মোট {bn(items.length)} টির মধ্যে
        </p>
      )}

      {cur && (
        <div className="lb" role="dialog" aria-modal="true" onClick={close}>
          <div className="lb-top" onClick={(e) => e.stopPropagation()}>
            <span className="lb-count">{bn(open + 1)} / {bn(items.length)}</span>
            <button type="button" className="lb-btn" onClick={close} aria-label="বন্ধ করুন">✕</button>
          </div>

          <div className="lb-stage">
            {items.length > 1 && (
              <button type="button" className="lb-btn lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="আগের ছবি">‹</button>
            )}
            <img key={cur._id} src={cur.image} alt={cur.title || ''} onClick={(e) => e.stopPropagation()} />
            {items.length > 1 && (
              <button type="button" className="lb-btn lb-nav lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="পরের ছবি">›</button>
            )}
          </div>

          <div className="lb-cap" onClick={(e) => e.stopPropagation()}>{cur.title}</div>
        </div>
      )}
    </>
  );
}