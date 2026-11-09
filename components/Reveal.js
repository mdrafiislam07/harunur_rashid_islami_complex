'use client';

import { useEffect } from 'react';

// footer ekhane nei, tai footer kokhono hide hobe na
const SEL = '.card,.tcard,.nlist li,.notice,.gal figure,.admbox,.sec h2';

export default function Reveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timers = new Set();

    const finish = (el) => {
      el.classList.add('in');
      const id = setTimeout(() => {
        el.classList.remove('rv', 'in');
        timers.delete(id);
      }, 1000);
      timers.add(id);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          finish(e.target);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    );

    let n = 0;
    const scan = () => {
      document.querySelectorAll(SEL).forEach((el) => {
        if (el.dataset.rv) return;
        el.dataset.rv = '1';

        // already screen e thakle hide korbo na
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) return;

        el.style.setProperty('--d', (n++ % 4) * 70 + 'ms');
        el.classList.add('rv');
        io.observe(el);
      });
    };

    scan();

    let raf;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // safety: 3 second por kono kichu hidden thakbe na
    const safety = setTimeout(() => {
      document.querySelectorAll('.rv:not(.in)').forEach(finish);
    }, 3000);

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      timers.forEach(clearTimeout);
    };
  }, []);

  return null;
}