'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { fadeUp, homeViewport, scaleIn, slideInLeft, slideInRight } from '@/lib/home-motion';

const presets = {
  fadeUp,
  scaleIn,
  slideInLeft,
  slideInRight,
} as const;

type RevealPreset = keyof typeof presets;

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  preset?: RevealPreset;
  delay?: number;
};

export function ScrollReveal({
  children,
  preset = 'fadeUp',
  delay = 0,
  className,
  ...rest
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const variants = presets[preset];

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={homeViewport}
      transition={delay ? { delay } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
