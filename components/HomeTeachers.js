// frontend/components/HomeTeachers.js
// Home page-e purono teacher section-er jaygay eta boshao:
//   import HomeTeachers from '@/components/HomeTeachers';
//   <HomeTeachers list={teachers} />          // teachers = await get('/teachers')
import Link from 'next/link';
import TeacherCard from '@/components/TeacherCard';
import { sortTeachers, getCat } from '@/lib/teacherCategories';

export default function HomeTeachers({ list = [], limit = 4 }) {
  const items = sortTeachers(list).slice(0, limit);
  if (!items.length) return null;

  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sh">
          <h2>আমাদের শিক্ষকবৃন্দ</h2>
          <Link href="/teachers">সবাইকে দেখুন →</Link>
        </div>
        <div className="tm-grid">
          {items.map((t) => (
            <TeacherCard key={t._id} t={t} female={getCat(t.category).female} />
          ))}
        </div>
        <div className="tm-more-wrap">
          <Link href="/teachers" className="btn">সব শিক্ষক ও টিম দেখুন</Link>
        </div>
      </div>
    </section>
  );
}