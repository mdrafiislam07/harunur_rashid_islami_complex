// frontend/app/(site)/gallery/page.js   (purono ta replace koro)
import { get } from '@/lib/api';
import PageHero from '@/components/PageHero';
import GalleryGrid from '@/components/GalleryGrid';

export const metadata = { title: 'গ্যালারি' };

export default async function Gallery() {
  const items = ((await get('/gallery')) || [])
    .filter((g) => g.image)
    .map((g) => ({ _id: String(g._id), title: g.title || '', image: g.image }));

  return (
    <>
      <PageHero title="গ্যালারি" sub="মাদরাসার স্মরণীয় মুহূর্ত ও কার্যক্রমের ছবি।" />
      <section className="tm-sec">
        <div className="tm-wrap">
          <GalleryGrid items={items} />
        </div>
      </section>
    </>
  );
}