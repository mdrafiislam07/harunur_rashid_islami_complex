'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const nav = [
  ['/admin', 'ড্যাশবোর্ড'],
  ['/admin/students', 'ছাত্র-ছাত্রী'],
  ['/admin/accounts', 'স্টুডেন্ট অ্যাকাউন্ট'],
  ['/admin/results', 'রেজাল্ট'],
  ['/admin/teachers', 'শিক্ষক'],
  ['/admin/founder', 'প্রতিষ্ঠাতা'],
  ['/admin/notices', 'নোটিশ'],
  ['/admin/gallery', 'গ্যালারি'],
  ['/admin/admissions', 'ভর্তি আবেদন'],
  ['/admin/live', 'লাইভ স্ট্রিমিং'],
  ['/admin/settings', 'সাইট সেটিং'],
];

export default function AdminLayout({ children }) {
  const p = usePathname();
  const r = useRouter();
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (p === '/admin/login') {
      setOk(true);
      return;
    }

    api('/auth/me')
      .then(() => setOk(true))
      .catch(() => {
        localStorage.removeItem('token');
        r.replace('/admin/login');
      });
  }, [p, r]);

  if (!ok) return null;
  if (p === '/admin/login') return children;

  return (
    <div className="adm">
      <div className="admbar">
        <button
          type="button"
          className="burger"
          aria-label="মেনু"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        অ্যাডমিন প্যানেল
      </div>

      <div className={'scrim' + (open ? ' on' : '')} onClick={() => setOpen(false)} />

      <aside className={open ? 'open' : ''}>
        <h2>অ্যাডমিন প্যানেল</h2>

        {nav.map(([h, l]) => (
          <Link key={h} href={h} className={p === h ? 'on' : ''}>
            {l}
          </Link>
        ))}

        <Link href="/">ওয়েবসাইট দেখুন</Link>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            r.replace('/admin/login');
          }}
        >
          লগআউট
        </button>
      </aside>

      <section className="admmain">{children}</section>
    </div>
  );
}
