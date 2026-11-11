// frontend/app/(site)/teachers/view/page.js   (NOTUN file -- "view" folder, bracket nai)
// URL: /teachers/view?id=XXXX
import { get } from '@/lib/api';
import TeacherProfile from '@/components/TeacherProfile';
import Missing from '@/components/Missing';
import { SITE_NAME } from '@/lib/teacherCategories';

export const dynamic = 'force-dynamic'; // shobshomoy notun kore data ane

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
  const t = id ? (await load()).find((x) => String(x._id) === id) : null;
  return { title: t ? `${t.name} | ${SITE_NAME}` : 'শিক্ষক প্রোফাইল' };
}

export default async function TeacherView({ searchParams }) {
  const raw = await load();
  const id = pickId(searchParams);
  const t = id ? raw.find((x) => String(x._id) === id) : null;

  if (!t) {
    return <Missing text="এই প্রোফাইলটি খুঁজে পাওয়া যায়নি।" href="/teachers" label="← সব শিক্ষক দেখুন" />;
  }
  return <TeacherProfile t={t} list={raw} />;
}