// frontend/lib/format.js  (notun file)
export const clean = (s = '') =>
  String(s).replace(/&nbsp;/g, ' ').replace(/[ \t]+\n/g, '\n').trim();

const bn = (d, o) => new Intl.DateTimeFormat('bn-BD', o).format(d);

// Notice ke card-er jonno ready kore (server-e cholbe)
export function prepNotice(n, withBody = false) {
  const raw = n.date || String(n.createdAt || '').slice(0, 10);
  const d = new Date(raw + 'T00:00:00');
  const ok = !isNaN(d);
  const body = clean(n.body);
  return {
    _id: String(n._id),
    title: n.title,
    category: n.category || 'সাধারণ',
    excerpt: body.replace(/\s+/g, ' ').slice(0, 230),
    ...(withBody ? { body } : {}),
    day: ok ? bn(d, { day: 'numeric' }) : '',
    mon: ok ? bn(d, { month: 'short' }) : '',
    full: ok ? bn(d, { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    ts: ok ? d.getTime() : 0,
    isNew: ok && Date.now() - d.getTime() < 7 * 864e5,
  };
}

export const sortNotices = (list) => [...list].sort((a, b) => b.ts - a.ts);