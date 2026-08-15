'use client';

import { useState } from 'react';
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

const panels = [
  {
    id: 'investors',
    label: 'Investors',
    icon: 'account_balance_wallet',
    title: 'Put Capital Into Agents That Return It',
    body: 'Participate in structured ICOs, track claims and holdings, and watch buybacks land on chain in real time.',
    cta: 'Open Investor Dashboard',
    href: '/dashboard',
    visual: 'payments',
  },
  {
    id: 'deployers',
    label: 'Deployers',
    icon: 'rocket_launch',
    title: 'Launch With Locked Buybacks From Day One',
    body: 'Raise at 10% of FDV, route revenue through an immutable 90/10 split, and show investors proof, not promises.',
    cta: 'Go To Deployer Dashboard',
    href: '/deploy',
    visual: 'rocket_launch',
  },
  {
    id: 'builders',
    label: 'Builders',
    icon: 'edit_note',
    title: 'Apply To List Your AI Agent',
    body: 'Submit profile, revenue wallet, and ICO config. Admin review gates every launch so quality stays high.',
    cta: 'Start Application',
    href: '/apply',
    visual: 'edit_note',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: 'explore',
    title: 'Find Agents With Live Performance',
    body: 'Filter by tier, category, and status. Open any agent page for buyback feeds, tokenomics, and risk.',
    cta: 'Discover Agents',
    href: '/discover',
    visual: 'explore',
  },
] as const;

const faqs = [
  {
    q: 'What Makes arca Different From Other Launchpads?',
    a: 'The product is the buyback engine. Capital raises get you in; immutable on chain 90/10 buybacks are why investors stay.',
  },
  {
    q: 'How Does The 90/10 Buyback Split Work?',
    a: 'When an agent generates revenue, 90% automatically buys its own token and 10% buys the platform token. The split is locked in the contract.',
  },
  {
    q: 'Who Can Launch An Agent On arca?',
    a: 'Anyone can apply. Admin review assigns tier (Seed, Core, or Pro) and must approve before an ICO goes live.',
  },
  {
    q: 'Which Chains Does V1 Support?',
    a: 'Solana and Robinhood Chain (EVM L2). Agents pick a chain at application; buybacks and ICOs run on that network.',
  },
];

export function AudiencePanels() {
  const [tab, setTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const active = panels[tab];
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-ink">
      {/* Tabbed audience panel */}
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
              className="font-display font-bold text-chalk text-2xl sm:text-4xl lg:text-5xl text-center mb-6 sm:mb-10 text-balance tracking-tight px-1"
            >
              Built For Every Side Of The Market
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
                <h3 className="font-display font-bold text-chalk text-xl sm:text-3xl mb-3 sm:mb-4 text-balance">
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

      {/* Rounded CTA banner */}
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
              <h3 className="font-display font-bold text-white text-2xl sm:text-4xl text-balance leading-tight">
                Start Today With arca
              </h3>
              <div>
                <p className="text-white/90 text-sm sm:text-lg mb-5 sm:mb-6 leading-relaxed">
                  Explore live agents, join the waitlist, or sign in to dashboards with the demo
                  account and see the full flow.
                </p>
                <Link href="/discover" className="inline-block w-full sm:w-auto">
                  <MdFilledButton className="hero-cta-filled" style={{ width: '100%' }}>
                    Explore Agents
                  </MdFilledButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="pb-16 sm:pb-24 lg:pb-28">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            variants={fadeUp}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={homeViewport}
            className="font-display font-bold text-chalk text-2xl sm:text-4xl lg:text-5xl text-center mb-8 sm:mb-12 text-balance tracking-tight px-1"
          >
            Have Questions? We&apos;ve Got Answers
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
                  key={item.q}
                  variants={fadeUp}
                  className="border-b border-white/10"
                >
                  <div className="w-full flex items-start sm:items-center justify-between gap-3 py-5 sm:py-6">
                    <button
                      type="button"
                      className="flex-1 text-left font-display font-bold text-chalk text-base sm:text-xl pr-2"
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
