// frontend/components/TeacherProfile.js  (notun)
import Link from 'next/link';
import TeacherCard, { Avatar } from '@/components/TeacherCard';
import { SITE_NAME, getCat, catLabel, isFemale, sortTeachers, clean } from '@/lib/teacherCategories';

export default function TeacherProfile({ t, list }) {
  const cat = getCat(t.category);
  const label = catLabel(t.category).toLowerCase();
  const others = sortTeachers(list)
    .filter((x) => catLabel(x.category).toLowerCase() === label && String(x._id) !== String(t._id))
    .slice(0, 4);

  return (
    <>
      <section className="tm-hero slim">
        <div className="wrap">
          <nav className="tm-crumb">
            <Link href="/">{SITE_NAME}</Link> <span>/</span> <Link href="/teachers">আমাদের পরিবার</Link> <span>/</span> {t.name}
          </nav>
        </div>
      </section>

      <section className="tm-sec">
        <div className="tm-wrap">
          <article className="tp">
            <aside className="tp-side">
              <div className="tp-photo">{t.image ? <img src={t.image} alt={t.name} /> : <Avatar female={isFemale(t)} />}</div>
              <span className="tp-badge">{cat.short}</span>
              {t.phone && <a className="tp-call" href={`tel:${t.phone}`}>📞 {t.phone}</a>}
            </aside>

            <div className="tp-main">
              <h1>{t.name}</h1>
              {t.designation && <p className="tp-role">{t.designation}</p>}
              {t.subject && <p className="tp-subject">{t.subject}</p>}

              <div className="tp-line" />
              <h2>পরিচিতি</h2>
              {t.bio ? <p className="tp-bio">{clean(t.bio)}</p> : <p className="muted">বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।</p>}

              <Link href="/teachers" className="tp-back">← সবাইকে দেখুন</Link>
            </div>
          </article>

          {others.length > 0 && (
            <div className="tm-block" style={{ marginTop: 64 }}>
              <h2 className="tm-title">একই বিভাগের অন্যান্য সদস্য</h2>
              <div className="tm-grid">
                {others.map((o) => <TeacherCard key={o._id} t={o} female={isFemale(o)} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}