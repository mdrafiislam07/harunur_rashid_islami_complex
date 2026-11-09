import './globals.css';
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google';
import { get, DEFAULT_SETTINGS, DEFAULT_LOGO } from '@/lib/api';

const body = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600'], variable: '--body' });
const head = Noto_Serif_Bengali({ subsets: ['bengali', 'latin'], weight: ['600', '800'], variable: '--head' });

// Browser tab er title/favicon admin settings theke ashe
export async function generateMetadata() {
  const s = { ...DEFAULT_SETTINGS, ...(await get('/settings', {})) };
  return {
    title: s.name || DEFAULT_SETTINGS.name,
    description: s.tagline || 'মাদরাসার অফিসিয়াল ওয়েবসাইট',
    icons: { icon: s.logo || DEFAULT_LOGO },
  };
}

export default function Root({ children }) {
  return <html lang="bn"><body className={`${body.variable} ${head.variable}`}>{children}</body></html>;
}