'use client';

import { useEffect, useState } from 'react';
import LivePlayer, { API } from '@/components/LivePlayer';

export default function LivePage() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${API}/live`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load live status');
        const data = await res.json();
        if (alive) setLive(data);
      } catch (error) {
        console.error('Live status error:', error);
      }
    };
    load();
    const id = setInterval(load, 8000); // live on/off 8 second por por check
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <main style={{ minHeight: '70vh', padding: '24px 16px 56px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto 20px' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#111827' }}>
          {live?.isLive && live.title ? live.title : 'লাইভ সম্প্রচার'}
        </h1>
        {live?.isLive && live.description && (
          <p style={{ margin: '10px 0 0', lineHeight: 1.7, color: '#374151' }}>{live.description}</p>
        )}
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <LivePlayer live={live} />
      </div>
    </main>
  );
}