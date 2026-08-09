'use client';

import { useEffect, useState } from 'react';
import { MdLinearProgress } from '@/components/material';

/** Sticky page scroll progress (homepage). */
export function ScrollProgress() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setValue(max > 0 ? el.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <MdLinearProgress value={value} max={1} style={{ width: '100%', height: 3 }} />
    </div>
  );
}
