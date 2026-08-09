'use client';

import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { useReducedMotion } from 'framer-motion';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.1,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
