import { get } from '@/lib/api';
export const metadata = { title: 'নোটিশ বোর্ড' };
export default async function Notices() {
  const list = await get('/notices');
  return <section className="sec"><div className="wrap narrow"><h1 className="ph1">নোটিশ বোর্ড</h1>
    {list.length === 0 && <p className="muted">এখনো কোনো নোটিশ নেই।</p>}
    {list.map(n => <article className="notice" key={n._id}><div className="meta"><time>{n.date}</time><span className="tag">{n.category}</span></div><h3>{n.title}</h3><p>{n.body}</p></article>)}
  </div></section>;
}
