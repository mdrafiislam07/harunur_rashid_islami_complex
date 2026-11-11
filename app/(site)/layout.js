// frontend/app/(site)/layout.js  (replace)
import Link from 'next/link';
import { get, DEFAULT_SETTINGS, DEFAULT_LOGO } from '@/lib/api';
import SiteNav from '@/components/SiteNav';
import Reveal from '@/components/Reveal';

export default async function SiteLayout({ children }) {
  const s = { ...DEFAULT_SETTINGS, ...(await get('/settings', {})) };
  const name = s.name || DEFAULT_SETTINGS.name;
  const logo = s.logo || DEFAULT_LOGO;

  return (
    <>
      <SiteNav name={name} logo={logo} />
      <Reveal />
      <main>{children}</main>
      <footer className="foot">
        <div className="wrap fgrid">
          <div>
            <img src={logo} alt="" className="flogo" />
            <h3>{name}</h3>
            <p>{s.tagline}</p>
          </div>
          <div>
            <h3>যোগাযোগ</h3>
            {s.address && <p>{s.address}</p>}
            {s.phone && <p>{s.phone}</p>}
            {s.email && <p>{s.email}</p>}
            {!s.address && !s.phone && !s.email && <p>যোগাযোগের তথ্য শীঘ্রই যোগ করা হবে।</p>}
          </div>
          <div>
            <h3>লিংক</h3>
            <p><Link href="/founder">প্রতিষ্ঠাতা পরিচিতি</Link></p>
            <p><Link href="/notices">নোটিশ বোর্ড</Link></p>
            <p><Link href="/teachers">শিক্ষকবৃন্দ</Link></p>
            <p><Link href="/gallery">গ্যালারি</Link></p>
            <p><Link href="/admission">অনলাইন ভর্তি</Link></p>
            <p><Link href="/live">লাইভ দেখুন</Link></p>
            <p><Link href="/student/login">স্টুডেন্ট লগইন</Link></p>
            <p><Link href="/admin">অ্যাডমিন লগইন</Link></p>
          </div>
        </div>
        <div className="wrap">
          <p style={{ textAlign: 'center', marginTop: 24 }}>© {new Date().getFullYear()} {name}</p>
        </div>
      </footer>
    </>
  );
}