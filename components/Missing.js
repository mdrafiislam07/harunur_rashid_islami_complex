// frontend/components/Missing.js  (notun) -- profile/notice na pele sundor message (black 404 na)
import Link from 'next/link';
import { SITE_NAME } from '@/lib/teacherCategories';

export default function Missing({ text, href, label }) {
  return (
    <>
      <section className="tm-hero slim">
        <div className="wrap">
          <nav className="tm-crumb"><Link href="/">{SITE_NAME}</Link></nav>
        </div>
      </section>
      <section className="tm-sec">
        <div className="tm-wrap">
          <div className="nb-empty">
            <div>🔎</div>
            <p>{text}</p>
            <Link href={href} className="tp-back">{label}</Link>
          </div>
        </div>
      </section>
    </>
  );
}