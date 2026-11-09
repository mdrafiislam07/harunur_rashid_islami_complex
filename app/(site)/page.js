import Link from 'next/link';
import { get, DEFAULT_SETTINGS } from '@/lib/api';
const programs = [
  ['হিফজ বিভাগ', 'অভিজ্ঞ হাফেজ উস্তাদের তত্ত্বাবধানে পূর্ণ কুরআন হিফজ।'],
  ['নূরানী ও নাজেরা', 'সহীহ তিলাওয়াত ও প্রাথমিক দ্বীনি শিক্ষা।'],
  ['কিতাব বিভাগ', 'আরবি, ফিকহ, হাদিস ও তাফসীরের ধারাবাহিক পাঠ।'],
  ['আধুনিক শিক্ষা', 'বাংলা, ইংরেজি, গণিত ও বিজ্ঞানের সমন্বিত পাঠ।'],
];
export default async function Home() {
  const [set, notices, teachers, gallery] = await Promise.all([get('/settings', {}), get('/notices'), get('/teachers'), get('/gallery')]);
  const s = { ...DEFAULT_SETTINGS, ...set };
  return (<>
    <section className="hero"><div className="wrap herogrid">
      <div>
        <p className="bismillah" lang="ar">بسم الله الرحمن الرحيم</p>
        <h1>{s.name}</h1>
        <p className="lead">{s.tagline}</p>
        <div className="row"><Link href="/admission" className="btn">অনলাইনে ভর্তি আবেদন</Link><Link href="/notices" className="btn ghost">নোটিশ দেখুন</Link></div>
      </div>
      <div className="heroimg">{s.image ? <img src={s.image} alt={s.name} /> : <div className="arch" aria-hidden="true"><span>العلم نور</span></div>}</div>
    </div></section>

    {s.about && <section className="sec"><div className="wrap narrow"><h2>আমাদের পরিচয়</h2><p className="about">{s.about}</p></div></section>}

    <section className="sec alt"><div className="wrap"><h2>শিক্ষা কার্যক্রম</h2>
      <div className="grid4">{programs.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>

    <section className="sec"><div className="wrap split">
      <div><div className="sh"><h2>সর্বশেষ নোটিশ</h2><Link href="/notices">সব নোটিশ</Link></div>
        {notices.length === 0 && <p className="muted">এখনো কোনো নোটিশ দেওয়া হয়নি।</p>}
        <ul className="nlist">{notices.slice(0, 5).map(n => <li key={n._id}><time>{n.date}</time><div><b>{n.title}</b><span className="tag">{n.category}</span></div></li>)}</ul></div>
      <div className="admbox"><h2>ভর্তি চলছে</h2><p>নতুন শিক্ষাবর্ষে ভর্তির জন্য অনলাইনে আবেদন করুন। আমরা আপনার সাথে ফোনে যোগাযোগ করব।</p><Link href="/admission" className="btn gold">আবেদন ফর্ম</Link></div>
    </div></section>

    {teachers.length > 0 && <section className="sec alt"><div className="wrap"><div className="sh"><h2>আমাদের শিক্ষকগণ</h2><Link href="/teachers">সবাইকে দেখুন</Link></div>
      <div className="grid4">{teachers.slice(0, 4).map(t => <div className="tcard" key={t._id}>{t.image ? <img src={t.image} alt={t.name} /> : <div className="ph">{t.name[0]}</div>}<h3>{t.name}</h3><p>{t.designation}</p></div>)}</div></div></section>}

    {gallery.length > 0 && <section className="sec"><div className="wrap"><div className="sh"><h2>গ্যালারি</h2><Link href="/gallery">আরও ছবি</Link></div>
      <div className="gal">{gallery.slice(0, 6).map(g => <img key={g._id} src={g.image} alt={g.title || 'ছবি'} />)}</div></div></section>}
  </>);
}
