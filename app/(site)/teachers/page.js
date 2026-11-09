import { get } from '@/lib/api';
export const metadata = { title: 'শিক্ষকবৃন্দ' };
export default async function Teachers() {
  const list = await get('/teachers');
  return <section className="sec"><div className="wrap"><h1 className="ph1">শিক্ষকবৃন্দ</h1>
    {list.length === 0 && <p className="muted">শিক্ষকদের তথ্য শীঘ্রই যোগ করা হবে।</p>}
    <div className="grid4">{list.map(t => <div className="tcard" key={t._id}>{t.image ? <img src={t.image} alt={t.name} /> : <div className="ph">{t.name[0]}</div>}
      <h3>{t.name}</h3><p><b>{t.designation}</b></p>{t.subject && <p>{t.subject}</p>}{t.bio && <p className="muted">{t.bio}</p>}</div>)}</div></div></section>;
}
