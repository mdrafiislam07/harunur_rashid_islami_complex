'use client';

import '@/app/portal.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Noto_Sans_Bengali } from 'next/font/google';
import { studentApi, DEFAULT_LOGO, DEFAULT_SETTINGS } from '@/lib/api';

// Marksheet-er jonno porishkar Bengali font (shongkhya ১ ২ ৬ ৯ alada bojha jay)
const sheetFont = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  display: 'swap',
  variable: '--font-sheet',
});

export default function StudentLayout({ children }) {
  const p = usePathname();
  const r = useRouter();
  const [ok, setOk] = useState(false);
  const [site, setSite] = useState({});

  useEffect(() => {
    studentApi('/settings', { auth: false }).then(setSite).catch(() => {});
  }, []);

  useEffect(() => {
    if (p === '/student/login') {
      setOk(true);
      return;
    }

    setOk(false);
    studentApi('/student-auth/me')
      .then(() => setOk(true))
      .catch(() => {
        localStorage.removeItem('stoken');
        r.replace('/student/login');
      });
  }, [p, r]);

  if (!ok) return null;
  if (p === '/student/login') return children;

  return (
    <div className={sheetFont.variable}>
      <header className="stbar">
        <div className="wrap">
          <Link href="/student" className="stbrand">
            <img src={site.logo || DEFAULT_LOGO} alt="" />
            <span>{site.name || DEFAULT_SETTINGS.name}</span>
          </Link>

          <div className="stlinks">
            <Link href="/">ওয়েবসাইট</Link>
            <button
              onClick={() => {
                localStorage.removeItem('stoken');
                r.replace('/student/login');
              }}
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="stmain">
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}