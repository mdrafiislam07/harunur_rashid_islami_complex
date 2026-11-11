// frontend/app/(site)/teachers/page.js  (replace)
// /teachers        -> tālika
// /teachers?id=XXX -> oi teacher-er profile
import Link from 'next/link';
import { get } from '@/lib/api';
import PageHero from '@/components/PageHero';
import TeacherCard from '@/components/TeacherCard';
import TeacherProfile from '@/components/TeacherProfile';
import Missing from '@/components/Missing';
import { SITE_NAME, groupTeachers, isFemale } from '@/lib/teacherCategories';

async function load() {
  try {
    const r = await get('/teachers');
    return Array.isArray(r) ? r : [];
  } catch {
    return [];
  }
}
const pickId = (sp) => {
  const v = sp?.id;
  return v ? String(Array.isArray(v) ? v[0] : v) : '';
};

export async function generateMetadata({ searchParams }) {
  const id = pickId(searchParams);
  if (id) {
    const t = (await load()).find((x) => String(x._id) === id);
    if (t) return { title: `${t.name} | ${SITE_NAME}` };
  }
  return { title: 'আমাদের পরিবার' };
}

export default async function Teachers({ searchParams }) {
  const raw = await load();
  const id = pickId(searchParams);

  if (id) {
    const t = raw.find((x) => String(x._id) === id);
    if (t) return <TeacherProfile t={t} list={raw} />;
    return <Missing text="এই প্রোফাইলটি খুঁজে পাওয়া যায়নি।" href="/teachers" label="← সব শিক্ষক দেখুন" />;
  }

  const groups = groupTeachers(raw);
  return (
    <>
      <PageHero title="আমাদের পরিবার" sub="দ্বীনের খেদমতে নিয়োজিত সম্মানিত শিক্ষক ও ম্যানেজমেন্ট সদস্যবৃন্দ।" />
      <section className="tm-sec">
        <div className="tm-wrap">
          {groups.length === 0 && <p className="muted">শিক্ষকদের তথ্য শীঘ্রই যোগ করা হবে।</p>}
          {groups.map((g) => (
            <div className="tm-block" key={g.key}>
              <Link href="/" className="tm-eyebrow">{SITE_NAME}</Link>
              <h2 className="tm-title">{g.label}</h2>
              <div className="tm-grid">
                {g.items.map((t) => <TeacherCard key={t._id} t={t} female={isFemale(t)} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}