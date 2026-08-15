'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MdTabs,
  MdPrimaryTab,
  MdIcon,
  MdFilledButton,
  MdTextButton,
  MdFilledIconButton,
} from '@/components/material';
import {
  fadeUp,
  homeEase,
  homeViewport,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
} from '@/lib/home-motion';

const panels: Array<{
  id: string;
  label: string;
  icon: string;
  title: ReactNode;
  body: ReactNode;
  cta: string;
  href: string;
  visual: string;
}> = [
  {
    id: 'investors',
    label: 'Investors',
    icon: 'account_balance_wallet',
    title: (
      <>
        Put money into <em className="italic font-normal">agents</em> that give back
      </>
    ),
    body: (
      <>
        Join a raise, watch your claim, and see{' '}
        <em className="italic text-chalk">buybacks</em> land on chain.
      </>
    ),
    cta: 'Open investor dashboard',
    href: '/dashboard',
    visual: 'payments',
  },
  {
    id: 'deployers',
    label: 'Deployers',
    icon: 'rocket_launch',
    title: (
      <>
        Launch an agent with <em className="italic font-normal">buybacks</em> from day one
      </>
    ),
    body: (
      <>
        Raise at 10% of FDV, lock the 90/10 split, and show proof, not{' '}
        <em className="italic text-chalk">promises</em>.
      </>
    ),
    cta: 'Go to deployer dashboard',
    href: '/deploy',
    visual: 'rocket_launch',
  },
  {
    id: 'builders',
    label: 'Builders',
    icon: 'edit_note',
    title: (
      <>
        Apply to list your AI <em className="italic font-normal">agent</em>
      </>
    ),
    body: (
      <>
        Share your profile, wallet, and raise plan. We review so quality stays{' '}
        <em className="italic text-chalk">high</em>.
      </>
    ),
    cta: 'Start application',
    href: '/apply',
    visual: 'edit_note',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: 'explore',
    title: (
      <>
        Find agents with <em className="italic font-normal">live</em> numbers
      </>
    ),
    body: (
      <>
        Filter by Seed, Core, or Pro. Open any agent for buybacks, risk, and{' '}
        <em className="italic text-chalk">tokenomics</em>.
      </>
    ),
    cta: 'Discover agents',
    href: '/discover',
    visual: 'explore',
  },
];

const faqs = [
  {
    q: (
      <>
        What makes arca <em className="italic font-normal">different</em>?
      </>
    ),
    a: (
      <>
        The heart is the buyback engine. Raises get you in. On chain{' '}
        <em className="italic text-chalk">buybacks</em> are why people stay.
      </>
    ),
  },
  {
    q: (
      <>
        How does the <em className="italic font-normal">90/10</em> split work?
      </>
    ),
    a: (
      <>
        When an agent earns, 90% buys its own token and 10% buys the platform token. The split is{' '}
        <em className="italic text-chalk">locked</em> in the contract.
      </>
    ),
  },
  {
    q: (
      <>
        Who can launch an <em className="italic font-normal">agent</em>?
      </>
    ),
    a: (
      <>
        Anyone can apply. We pick Seed, Core, or Pro and must say yes before a raise goes{' '}
        <em className="italic text-chalk">live</em>.
      </>
    ),
  },
  {
    q: (
      <>
        Which <em className="italic font-normal">chains</em> work?
      </>
    ),
    a: (
      <>
        Solana and Robinhood Chain. An agent picks one at apply time, then buybacks and raises run
        there.
      </>
    ),
  },
];

export function AudiencePanels() {
  const [tab, setTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const active = panels[tab];
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <section className="py-14 sm:py-20 lg:py-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            variants={staggerContainer}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={homeViewport}
          >
            <motion.h2
              variants={fadeUp}
              className="font-display font-medium text-chalk text-2xl sm:text-4xl lg:text-5xl text-center mb-6 sm:mb-10 text-balance tracking-tight px-1"
            >
              Built for every side of the <em className="italic font-normal">market</em>
            </motion.h2>

            <motion.div
              variants={fadeUp}
              className="mb-8 sm:mb-10 flex justify-center overflow-hidden"
            >
              <MdTabs
                className="audience-tabs"
                activeTabIndex={tab}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => setTab(e.target?.activeTabIndex ?? 0)}
              >
                {panels.map((p) => (
                  <MdPrimaryTab key={p.id}>{p.label}</MdPrimaryTab>
                ))}
              </MdTabs>
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              exit={reduceMotion ? undefined : 'hidden'}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center"
            >
              <motion.div
                variants={slideInLeft}
                className="order-2 md:order-1 text-left"
              >
                <h3 className="font-display font-medium text-chalk text-xl sm:text-3xl mb-3 sm:mb-4 text-balance">
                  {active.title}
                </h3>
                <p className="text-chalk-dim text-sm sm:text-lg leading-relaxed mb-5 sm:mb-6">
                  {active.body}
                </p>
                <Link href={active.href}>
                  <MdTextButton trailingIcon>
                    {active.cta}
                    <MdIcon slot="icon">arrow_forward</MdIcon>
                  </MdTextButton>
                </Link>
              </motion.div>

              <motion.div
                variants={slideInRight}
                className="order-1 md:order-2 aspect-[4/3] sm:aspect-square max-h-[280px] md:max-h-none mx-auto w-full rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-br from-[#5D74E5] via-[#4559C7] to-[#1F2740] flex items-center justify-center shadow-soft"
              >
                <div className="w-[72%] h-[72%] rounded-3xl bg-ink-light/95 flex flex-col items-center justify-center gap-3 border border-white/15">
                  <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                    <MdIcon className="arca-icon-lg">{active.visual}</MdIcon>
                  </span>
                  <span className="text-sm font-semibold text-chalk lowercase tracking-tight">
                    arca · {active.label}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="pb-14 sm:pb-20 lg:pb-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            variants={scaleIn}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={homeViewport}
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-brand px-6 py-8 sm:px-12 sm:py-14"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(ellipse 80% 120% at 100% 0%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(ellipse 60% 80% at 0% 100%, rgba(0,0,0,0.15), transparent 50%)',
              }}
              aria-hidden
            />
            <div className="relative grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-12 items-center">
              <h3 className="font-display font-medium text-white text-2xl sm:text-4xl text-balance leading-tight">
                Start today with <em className="italic font-normal">arca</em>
              </h3>
              <div>
                <p className="text-white/90 text-sm sm:text-lg mb-5 sm:mb-6 leading-relaxed">
                  Peek at live <em className="italic">agents</em>, join the waitlist, or sign in and
                  try the full flow.
                </p>
                <Link href="/discover" className="inline-block w-full sm:w-auto">
                  <MdFilledButton className="hero-cta-filled" style={{ width: '100%' }}>
                    Explore agents
                  </MdFilledButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24 lg:pb-28">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            variants={fadeUp}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={homeViewport}
            className="font-display font-medium text-chalk text-2xl sm:text-4xl lg:text-5xl text-center mb-8 sm:mb-12 text-balance tracking-tight px-1"
          >
            Have questions? We have <em className="italic font-normal">answers</em>
          </motion.h2>

          <motion.div
            className="border-t border-white/10"
            variants={staggerFast}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={homeViewport}
          >
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="border-b border-white/10"
                >
                  <div className="w-full flex items-start sm:items-center justify-between gap-3 py-5 sm:py-6">
                    <button
                      type="button"
                      className="flex-1 text-left font-display font-medium text-chalk text-base sm:text-xl pr-2"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                    >
                      {item.q}
                    </button>
                    <MdFilledIconButton
                      className="faq-plus shrink-0"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-label={open ? 'Collapse answer' : 'Expand answer'}
                    >
                      <MdIcon>{open ? 'close' : 'add'}</MdIcon>
                    </MdFilledIconButton>
                  </div>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: homeEase }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-chalk-dim text-base leading-relaxed max-w-2xl">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
