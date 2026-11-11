// frontend/app/(site)/notices/page.js  (replace)
// /notices        -> notice board
// /notices?id=XXX -> oi notice-er bistarito page
import { get } from '@/lib/api';
import PageHero from '@/components/PageHero';
import NoticeBoard from '@/components/NoticeBoard';
import NoticeView from '@/components/NoticeView';
import Missing from '@/components/Missing';
import { SITE_NAME } from '@/lib/teacherCategories';
import { prepNotice, sortNotices } from '@/lib/format';

async function load() {
  try {
    const r = await get('/notices');
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
    const n = (await load()).find((x) => String(x._id) === id);
    if (n) return { title: `${n.title} | ${SITE_NAME}` };
  }
  return { title: 'নোটিশ বোর্ড' };
}

export default async function Notices({ searchParams }) {
  const raw = await load();
  const id = pickId(searchParams);

  if (id) {
    const r = raw.find((x) => String(x._id) === id);
    if (!r) return <Missing text="এই নোটিশটি খুঁজে পাওয়া যায়নি।" href="/notices" label="← সব নোটিশ দেখুন" />;
    const n = prepNotice(r, true);
    const recent = sortNotices(raw.map((x) => prepNotice(x))).filter((x) => x._id !== n._id).slice(0, 5);
    return <NoticeView n={n} recent={recent} />;
  }

  const items = sortNotices(raw.map((n) => prepNotice(n)));
  return (
    <>
      <PageHero title="নোটিশ বোর্ড" sub="মাদরাসার সর্বশেষ বিজ্ঞপ্তি, ভর্তি ও গুরুত্বপূর্ণ ঘোষণাসমূহ।" />
      <section className="tm-sec">
        <div className="tm-wrap">
          <NoticeBoard items={items} />
        </div>
      </section>
    </>
  );
}