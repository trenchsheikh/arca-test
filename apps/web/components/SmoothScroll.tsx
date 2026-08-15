'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type ArcaWindow = Window & { __arcaLenis?: Lenis };

/**
 * Site-wide momentum scrolling via Lenis.
 * Uses an explicit RAF loop (more reliable than autoRaf under Next.js HMR)
 * and ignores prefers-reduced-motion so the effect always mounts.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const w = window as ArcaWindow;

    // Tear down any leftover instance from HMR
    w.__arcaLenis?.destroy();
    w.__arcaLenis = undefined;

    const lenis = new Lenis({
      wrapper: window,
      content: document.documentElement,
      lerp: 0.055,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.06,
      touchInertiaExponent: 1.7,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      autoRaf: false,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: false,
    });

    w.__arcaLenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      if (w.__arcaLenis === lenis) {
        w.__arcaLenis = undefined;
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
