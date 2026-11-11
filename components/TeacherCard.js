// frontend/components/TeacherCard.js  (replace)
import Link from 'next/link';
import { clean } from '@/lib/teacherCategories';

export function Avatar({ female }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <rect width="100" height="100" fill={female ? '#9fd5c0' : '#eef6f2'} />
      <circle cx="50" cy="38" r="17" fill="#111" />
      <path d="M18 100c0-22 14-34 32-34s32 12 32 34z" fill="#111" />
      {!female && <path d="M36 42c2 18 8 24 14 24s12-6 14-24c-4 8-9 10-14 10s-10-2-14-10z" fill="#111" />}
      {female && <ellipse cx="50" cy="40" rx="9" ry="3.5" fill="#f3c9a0" />}
    </svg>
  );
}

export default function TeacherCard({ t, female }) {
  return (
    // alada route: /teachers/view?id=...
    <Link href={`/teachers/view?id=${t._id}`} className="tm-card">
      <div className="tm-photo">{t.image ? <img src={t.image} alt={t.name} /> : <Avatar female={female} />}</div>
      <h3>{t.name}</h3>
      {t.designation && <p className="tm-role">{t.designation}</p>}
      {t.subject && <p className="tm-sub">{t.subject}</p>}
      {t.bio && <p className="tm-bio">{clean(t.bio)}</p>}
      <span className="tm-more">বিস্তারিত দেখুন <i>→</i></span>
    </Link>
  );
}