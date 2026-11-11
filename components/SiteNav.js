// frontend/components/SiteNav.js  (replace)
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'হোম' },
  { href: '/notices', label: 'নোটিশ' },
  { href: '/teachers', label: 'শিক্ষকবৃন্দ' },
  { href: '/founder', label: 'প্রতিষ্ঠাতা' },
  { href: '/gallery', label: 'গ্যালারি' },
  { href: '/live', label: 'লাইভ', live: true },
  { href: '/admission', label: 'ভর্তি আবেদন' },
];

export default function SiteNav({ name, logo }) {
  const p = usePathname();
  const [open, setOpen] = useState(false);

  // page bodlale mobile menu bondho
  useEffect(() => { setOpen(false); }, [p]);

  const isOn = (href) => (href === '/' ? p === '/' : p === href || p.startsWith(href + '/'));

  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="brand">
          <img src={logo} alt="" className="brandlogo" />
          <span>{name}</span>
        </Link>

        <button
          type="button"
          className="burger"
          aria-label="মেনু"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav className={open ? 'open' : ''}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={(l.live ? 'livelink ' : '') + (isOn(l.href) ? 'on' : '')}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/student/login" className="btn">স্টুডেন্ট লগইন</Link>
        </nav>
      </div>
    </header>
  );
}