'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FeatureMosaic } from '@/components/FeatureMosaic';
import { AudiencePanels } from '@/components/AudiencePanels';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MdIcon } from '@/components/material';
import { fadeUp, homeEase, staggerContainer } from '@/lib/home-motion';

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  const scrollToFeatures = () => {
    document.getElementById('home-features')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="relative">
      <ScrollProgress />

      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden text-center px-4 sm:px-8">
        <div className="relative container mx-auto w-full flex flex-1 flex-col items-center justify-center py-16 sm:py-24">
          <motion.div
            variants={staggerContainer}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="max-w-3xl w-full flex flex-col items-center"
          >
            <motion.p
              variants={fadeUp}
              className="font-display font-medium text-brand text-5xl sm:text-7xl lg:text-8xl mb-5 sm:mb-8 lowercase tracking-tight leading-[0.9]"
            >
              arca
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display font-medium text-chalk text-[1.85rem] leading-[1.15] sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.08] mb-4 sm:mb-7 text-balance tracking-tight max-w-[20ch] sm:max-w-none"
            >
              Agents that earn <em className="italic font-normal">trust</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-chalk-dim text-[0.95rem] sm:text-xl leading-relaxed mb-7 sm:mb-10 max-w-xl text-balance px-1"
            >
              They raise, they work, and they give value back in the{' '}
              <em className="italic text-chalk">open</em> so anyone can see.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mb-8 sm:mb-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/discover" className="glass-btn hero-agents-btn">
                See the agents
                <MdIcon>arrow_forward</MdIcon>
              </Link>
              <Link href="/apply" className="glass-btn hero-agents-btn hero-agents-btn-secondary">
                List an agent
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-chalk-dim font-semibold">
                Built On
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 opacity-80">
                <Image
                  src="/logos/robinhood.png?v=3"
                  alt="Robinhood"
                  width={200}
                  height={44}
                  className="h-9 md:h-7 w-auto object-contain brightness-0 invert"
                />
                <Image
                  src="/logos/solana.svg"
                  alt="Solana"
                  width={160}
                  height={30}
                  className="h-6 md:h-5 w-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.button
          type="button"
          onClick={scrollToFeatures}
          className="hero-scroll-cue mb-7 sm:mb-9 inline-flex items-center justify-center text-brand"
          aria-label="Scroll to features"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: [0, 8, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : {
                  opacity: { delay: 0.9, duration: 0.4, ease: homeEase },
                  y: {
                    delay: 1.1,
                    duration: 1.35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
          }
        >
          <MdIcon className="hero-scroll-icon">keyboard_arrow_down</MdIcon>
        </motion.button>
      </section>

      <FeatureMosaic />
      <AudiencePanels />
    </div>
  );
}
