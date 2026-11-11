// frontend/components/NoticeView.js  (notun)
import Link from 'next/link';
import { SITE_NAME } from '@/lib/teacherCategories';

export default function NoticeView({ n, recent }) {
  return (
    <>
      <section className="tm-hero slim">
        <div className="wrap">
          <nav className="tm-crumb">
            <Link href="/">{SITE_NAME}</Link> <span>/</span> <Link href="/notices">নোটিশ বোর্ড</Link> <span>/</span> বিস্তারিত
          </nav>
        </div>
      </section>

      <section className="tm-sec">
        <div className="tm-wrap nd">
          <article className="nd-art">
            <div className="nd-meta">
              <span className="nb-cat">{n.category}</span>
              {n.isNew && <span className="nb-new">নতুন</span>}
              <span className="nd-date">📅 {n.full}</span>
            </div>
            <h1 className="nd-title">{n.title}</h1>
            <div className="tp-line" />
            {n.body ? <div className="nd-body">{n.body}</div> : <p className="muted">কোনো বিস্তারিত বিবরণ নেই।</p>}
            <Link href="/notices" className="tp-back">← সব নোটিশ</Link>
          </article>

          <aside className="nd-side">
            <h3>সাম্প্রতিক নোটিশ</h3>
            {recent.length === 0 && <p className="muted">আর কোনো নোটিশ নেই।</p>}
            {recent.map((r) => (
              <Link key={r._id} href={`/notices?id=${r._id}`} className="nd-rec">
                <div className="nb-date sm"><b>{r.day}</b><span>{r.mon}</span></div>
                <div><strong>{r.title}</strong><small>{r.category}</small></div>
              </Link>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}