// frontend/app/(site)/teachers/page.js
import Link from 'next/link';
import { get } from '@/lib/api';
import TeacherCard from '@/components/TeacherCard';
import { CATEGORIES, SITE_NAME, sortTeachers } from '@/lib/teacherCategories';

export const metadata = { title: 'আমাদের পরিবার' };

export default async function Teachers() {
  const list = sortTeachers((await get('/teachers')) || []);

  return (
    <>
      <section className="tm-hero">
        <div className="wrap">
          <Link href="/" className="tm-brand">{SITE_NAME}</Link>
          <h1>আমাদের পরিবার</h1>
          <p>দ্বীনের খেদমতে নিয়োজিত সম্মানিত শিক্ষক ও ম্যানেজমেন্ট সদস্যবৃন্দ।</p>
        </div>
      </section>

      <section className="tm-sec">
        <div className="tm-wrap">
          {list.length === 0 && <p className="muted">শিক্ষকদের তথ্য শীঘ্রই যোগ করা হবে।</p>}
          {CATEGORIES.map((c) => {
            const items = list.filter((t) => (t.category || 'ustaz') === c.key);
            if (!items.length) return null;
            return (
              <div className="tm-block" key={c.key}>
                <Link href="/" className="tm-eyebrow">{SITE_NAME}</Link>
                <h2 className="tm-title">{c.label}</h2>
                <div className="tm-grid">
                  {items.map((t) => <TeacherCard key={t._id} t={t} female={c.female} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}