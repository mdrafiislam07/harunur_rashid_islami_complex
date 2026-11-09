import { get } from '@/lib/api';
export const metadata = { title: 'গ্যালারি' };
export default async function Gallery() {
  const list = await get('/gallery');
  return <section className="sec"><div className="wrap"><h1 className="ph1">ফটো গ্যালারি</h1>
    {list.length === 0 && <p className="muted">এখনো কোনো ছবি যোগ করা হয়নি।</p>}
    <div className="gal">{list.map(g => <figure key={g._id}><img src={g.image} alt={g.title || 'ছবি'} />{g.title && <figcaption>{g.title}</figcaption>}</figure>)}</div></div></section>;
}
