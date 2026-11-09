'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', 'হোম'],
  ['/notices', 'নোটিশ'],
  ['/teachers', 'শিক্ষকবৃন্দ'],
  ['/gallery', 'গ্যালারি'],
  ['/live', 'লাইভ'],
  ['/admission', 'ভর্তি আবেদন'],
];

export default function SiteNav({ name = 'হারুনুর রশিদ ইসলামী কমপ্লেক্স', logo = '/madrasa.jpg' }) {
  const [open, setOpen] = useState(false);
  const p = usePathname();

  // route change hole menu bondho
  useEffect(() => setOpen(false), [p]);

  // Esc diye bondho
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="brand">
          {logo && <img src={logo} alt="" className="brandlogo" />}
          <span>{name}</span>
        </Link>

        <button
          type="button"
          className="burger"
          aria-label="মেনু"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav id="site-menu" className={open ? 'open' : ''}>
          {links.map(([h, l]) => (
            <Link key={h} href={h} className={h === '/live' ? 'livelink' : ''}>{l}</Link>
          ))}
          <Link href="/student/login" className="btn sm">স্টুডেন্ট লগইন</Link>
        </nav>
      </div>
    </header>
  );
}