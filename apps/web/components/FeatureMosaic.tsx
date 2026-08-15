'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MdFab, MdIcon } from '@/components/material';
import {
  fadeUp,
  homeViewport,
  scaleIn,
  staggerContainer,
} from '@/lib/home-motion';

const cards = [
  {
    title: 'Verified Agents',
    body: 'Browse performance you can check: revenue, win rate, and risk in one place.',
    href: '/discover',
    icon: 'smart_toy',
    tone: 'rose',
    height: 'min-h-[240px] sm:min-h-[320px]',
  },
  {
    title: 'Automatic Buybacks',
    body: '90% of agent revenue buys agent tokens. 10% buys platform. Locked on chain.',
    href: '/discover',
    icon: 'autorenew',
    tone: 'sand',
    height: 'min-h-[240px] sm:min-h-[380px]',
  },
  {
    title: 'Structured ICOs',
    body: 'Fixed tokenomics, admin review, and a clear raise target at 10% of FDV.',
    href: '/apply',
    icon: 'savings',
    tone: 'mint',
    height: 'min-h-[240px] sm:min-h-[400px]',
  },
  {
    title: 'Explorer Proof',
    body: 'Every buyback ships with a transaction hash. No trust, just verification.',
    href: '/discover',
    icon: 'verified',
    tone: 'sky',
    height: 'min-h-[240px] sm:min-h-[300px]',
  },
] as const;

const toneStyles: Record<
  (typeof cards)[number]['tone'],
  { card: string; fabClass: string; ink: string }
> = {
  rose: {
    card: 'bg-[#3A1F28]',
    fabClass: 'mosaic-fab-rose',
    ink: 'bg-black/35 text-[#F0A8B4]',
  },
  sand: {
    card: 'bg-[#3A3224]',
    fabClass: 'mosaic-fab-sand',
    ink: 'bg-black/35 text-[#E8C48A]',
  },
  mint: {
    card: 'bg-[#1F3328]',
    fabClass: 'mosaic-fab-mint',
    ink: 'bg-black/35 text-[#8FD4AE]',
  },
  sky: {
    card: 'bg-[#1F2740]',
    fabClass: 'mosaic-fab-sky',
    ink: 'bg-black/35 text-[#A8B6F5]',
  },
};

export function FeatureMosaic() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="home-features" className="bg-ink py-16 sm:py-24 lg:py-28 scroll-mt-16">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto"
          variants={staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={homeViewport}
        >
          <motion.h2
            variants={fadeUp}
            className="font-display font-bold text-chalk text-2xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 text-balance tracking-tight"
          >
            Capital Markets Built For AI Agents
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-chalk-dim text-sm sm:text-lg text-balance px-1"
          >
            Raise, return, and prove value with buybacks anyone can verify on chain.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 md:items-start"
          variants={staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={homeViewport}
        >
          <motion.div
            variants={staggerContainer}
            className="flex flex-col gap-4 sm:gap-5 md:gap-6 md:pt-0"
          >
            <MosaicCard card={cards[0]} reduceMotion={!!reduceMotion} />
            <MosaicCard card={cards[2]} reduceMotion={!!reduceMotion} />
          </motion.div>
          <motion.div
            variants={staggerContainer}
            className="flex flex-col gap-4 sm:gap-5 md:gap-6 md:pt-16"
          >
            <MosaicCard card={cards[1]} reduceMotion={!!reduceMotion} />
            <MosaicCard card={cards[3]} reduceMotion={!!reduceMotion} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MosaicCard({
  card,
  reduceMotion,
}: {
  card: (typeof cards)[number];
  reduceMotion: boolean;
}) {
  const tone = toneStyles[card.tone];

  return (
    <motion.article
      variants={scaleIn}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
      }
      className={`relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 ${tone.card} ${card.height} flex flex-col will-change-transform border border-white/5`}
    >
      <h3 className="font-display font-bold text-chalk text-xl sm:text-[1.75rem] leading-tight max-w-[16ch] mb-3 sm:mb-4 pr-12">
        {card.title}
      </h3>
      <p className="text-chalk-muted text-sm sm:text-base leading-relaxed max-w-xs mb-4 sm:mb-6">
        {card.body}
      </p>

      <div className="mt-auto flex-1 flex items-center justify-center py-2 sm:py-4">
        <div
          className={`w-full max-w-[180px] sm:max-w-[220px] aspect-[4/3] rounded-2xl ${tone.ink} shadow-sm border border-white/10 flex flex-col items-center justify-center gap-2`}
        >
          <MdIcon className="arca-icon-lg">{card.icon}</MdIcon>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
            arca
          </span>
        </div>
      </div>

      <Link
        href={card.href}
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6"
        aria-label={`Learn more: ${card.title}`}
      >
        <MdFab className={tone.fabClass}>
          <MdIcon slot="icon">add</MdIcon>
        </MdFab>
      </Link>
    </motion.article>
  );
}
