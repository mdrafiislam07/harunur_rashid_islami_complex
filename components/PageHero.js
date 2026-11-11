// frontend/components/PageHero.js
// Je kono page-e (gallery, admission, about...) ei hero boshaw -- shob page-er look ek hobe
// Use: <PageHero title="গ্যালারি" sub="মাদরাসার মুহূর্তসমূহ" />
import Link from 'next/link';
import { SITE_NAME } from '@/lib/teacherCategories';

export default function PageHero({ title, sub }) {
  return (
    <section className="tm-hero">
      <div className="wrap">
        <Link href="/" className="tm-brand">{SITE_NAME}</Link>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </section>
  );
}