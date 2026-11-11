// frontend/app/(site)/founder/page.js  (notun)
import { get } from '@/lib/api';
import PageHero from '@/components/PageHero';
import { Avatar } from '@/components/TeacherCard';
import { clean } from '@/lib/teacherCategories';

export const metadata = { title: 'প্রতিষ্ঠাতা পরিচিতি' };
export const dynamic = 'force-dynamic';

async function load() {
  try {
    const r = await get('/founder');
    return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
  } catch {
    return {};
  }
}

export default async function FounderPage() {
  const f = await load();

  if (!f.name) {
    return (
      <>
        <PageHero title="প্রতিষ্ঠাতা পরিচিতি" sub="মাদরাসার প্রতিষ্ঠাতা ও প্রতিষ্ঠার ইতিহাস।" />
        <section className="tm-sec">
          <div className="tm-wrap">
            <div className="nb-empty"><div>🕌</div><p>প্রতিষ্ঠাতার তথ্য শীঘ্রই যোগ করা হবে।</p></div>
          </div>
        </section>
      </>
    );
  }

  const facts = [
    ['জন্ম', f.born],
    ['শিক্ষাগত যোগ্যতা', f.education],
    ['প্রতিষ্ঠার সাল', f.foundedYear],
    ...(f.facts || []).map((x) => [x.label, x.value]),
  ].filter(([l, v]) => l && v);
  const timeline = (f.timeline || []).filter((x) => x.title || x.text);

  return (
    <>
      <PageHero title="প্রতিষ্ঠাতা পরিচিতি" sub="মাদরাসার প্রতিষ্ঠাতা ও প্রতিষ্ঠার ইতিহাস।" />

      <section className="tm-sec">
        <div className="tm-wrap">
          {/* প্রোফাইল */}
          <article className="tp">
            <aside className="tp-side">
              <div className="tp-photo">{f.image ? <img src={f.image} alt={f.name} /> : <Avatar female={false} />}</div>
              <span className="tp-badge">প্রতিষ্ঠাতা</span>
              {f.phone && <a className="tp-call" href={`tel:${f.phone}`}>📞 {f.phone}</a>}
              {f.email && <a className="tp-call" href={`mailto:${f.email}`}>✉️ {f.email}</a>}
              {f.facebook && <a className="tp-call" href={f.facebook} target="_blank" rel="noopener noreferrer">ফেসবুক ↗</a>}
              {f.website && <a className="tp-call" href={f.website} target="_blank" rel="noopener noreferrer">ওয়েবসাইট ↗</a>}
            </aside>

            <div className="tp-main">
              <h1>{f.name}</h1>
              {f.title && <p className="tp-role">{f.title}</p>}
              {f.quote && <p className="fd-short">{f.quote}</p>}

              <div className="tp-line" />
              <h2>জীবনী ও পরিচিতি</h2>
              {f.about ? <p className="tp-bio">{clean(f.about)}</p> : <p className="muted">বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।</p>}
            </div>
          </article>

          {/* দ্রুত তথ্য */}
          {facts.length > 0 && (
            <div className="tm-block fd-sec">
              <h2 className="tm-title">এক নজরে</h2>
              <div className="fd-facts">
                {facts.map(([l, v], i) => (
                  <div className="fd-fact" key={i}><small>{l}</small><b>{v}</b></div>
                ))}
              </div>
            </div>
          )}

          {/* বাণী */}
          {f.message && (
            <div className="tm-block fd-sec">
              <h2 className="tm-title">প্রতিষ্ঠাতার বাণী</h2>
              <blockquote className="fd-quote">
                <p>{clean(f.message)}</p>
                <footer>— {f.name}{f.title ? `, ${f.title}` : ''}</footer>
              </blockquote>
            </div>
          )}

          {/* ভিশন / মিশন */}
          {(f.vision || f.mission) && (
            <div className="tm-block fd-sec">
              <h2 className="tm-title">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
              <div className="fd-two">
                {f.vision && <div className="card"><h3>🎯 ভিশন</h3><p className="fd-pre">{clean(f.vision)}</p></div>}
                {f.mission && <div className="card"><h3>🌿 মিশন</h3><p className="fd-pre">{clean(f.mission)}</p></div>}
              </div>
            </div>
          )}

          {/* ইতিহাস */}
          {timeline.length > 0 && (
            <div className="tm-block fd-sec">
              <h2 className="tm-title">প্রতিষ্ঠার ইতিহাস</h2>
              <ul className="fd-tl">
                {timeline.map((t, i) => (
                  <li key={i}>
                    {t.year && <span className="fd-year">{t.year}</span>}
                    {t.title && <h3>{t.title}</h3>}
                    {t.text && <p>{clean(t.text)}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}