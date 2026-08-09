'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { WaitlistForm } from '@/components/WaitlistForm';
import { BuybackFlowDiagram } from '@/components/BuybackFlowDiagram';
import { ArcaLogo } from '@/components/ArcaLogo';
import { ScrollProgress } from '@/components/ScrollProgress';
import {
  MdFilledButton,
  MdOutlinedButton,
  MdList,
  MdListItem,
  MdIcon,
  MdDivider,
  MdChipSet,
  MdAssistChip,
  MdLinearProgress,
  MdFilledTonalButton,
} from '@/components/material';

const steps = [
  {
    n: '01',
    title: 'Structured ICO',
    body: 'Admin-reviewed raises with fixed tokenomics. 10% of FDV funds operations.',
    icon: 'savings',
  },
  {
    n: '02',
    title: 'Automatic Buybacks',
    body: '90% of revenue buys agent tokens, 10% platform. Immutable and on-chain.',
    icon: 'autorenew',
    highlight: true,
  },
  {
    n: '03',
    title: 'Verified Performance',
    body: 'Revenue, trades, and buybacks are public. Verify live — no trust required.',
    icon: 'verified',
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      <ScrollProgress />

      {/* Hero — brand first, one composition */}
      <section className="relative min-h-[100svh] flex items-end sm:items-center overflow-hidden">
        <div
          className="absolute inset-0 brand-gradient opacity-[0.92]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-white/40"
          aria-hidden
        />
        <motion.div
          className="absolute -right-24 top-10 h-[70vmin] w-[70vmin] rounded-full bg-white/10 blur-3xl"
          aria-hidden
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <ArcaLogo size={56} showWordmark={false} />
            </motion.div>

            <h1 className="font-display font-bold text-white text-6xl sm:text-7xl lg:text-8xl mb-5 lowercase tracking-tight leading-[0.9]">
              arca
            </h1>

            <p className="text-white/90 text-xl sm:text-2xl mb-3 max-w-xl text-balance">
              AI agents that actually return value
            </p>
            <p className="text-white/70 text-base sm:text-lg mb-10 max-w-lg text-balance">
              Raise capital. Prove it on-chain. Automated 90/10 buybacks anyone can verify.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Link href="/discover">
                <MdFilledButton className="hero-cta-filled" style={{ minWidth: 200 }}>
                  <MdIcon slot="icon">explore</MdIcon>
                  Discover Agents
                </MdFilledButton>
              </Link>
              <Link href="/login">
                <MdOutlinedButton className="hero-cta-outlined" style={{ minWidth: 200 }}>
                  <MdIcon slot="icon">login</MdIcon>
                  Login
                </MdOutlinedButton>
              </Link>
            </div>

            <p className="text-white/60 text-sm mb-10">
              Demo:{' '}
              <span className="text-white font-medium">admin</span> /{' '}
              <span className="text-white font-medium">pass</span>
            </p>

            <div className="max-w-lg rounded-2xl bg-white/95 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-brand font-semibold mb-3">
                Early access
              </p>
              <WaitlistForm />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-ink">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <MdChipSet className="mb-4">
                <MdAssistChip label="How it works">
                  <MdIcon slot="icon">route</MdIcon>
                </MdAssistChip>
              </MdChipSet>
              <h2 className="arca-section-title mb-3">Three layers. One product.</h2>
              <p className="text-chalk-dim text-lg max-w-xl">
                Capital in, buybacks out, performance you can audit.
              </p>
            </div>
            <MdLinearProgress
              value={1}
              max={1}
              style={{ width: 160, height: 4 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`arca-surface ${step.highlight ? 'buyback-glow' : ''}`}
              >
                <MdList style={{ border: 'none', background: 'transparent' }}>
                  <MdListItem>
                    <MdIcon slot="start">{step.icon}</MdIcon>
                    <div slot="overline">{step.n}</div>
                    <div slot="headline">{step.title}</div>
                    <div slot="supporting-text">{step.body}</div>
                  </MdListItem>
                </MdList>
              </motion.div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <BuybackFlowDiagram />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-chalk text-4xl mb-4">
                The buyback engine is the product
              </h2>
              <p className="text-chalk-dim text-lg mb-6">
                Other launchpads raise and leave. arca keeps returning value on every revenue cycle.
              </p>
              <Link href="/discover">
                <MdFilledTonalButton>
                  <MdIcon slot="icon">trending_up</MdIcon>
                  See live agents
                </MdFilledTonalButton>
              </Link>
            </div>

            <div className="arca-surface overflow-hidden">
              <MdList style={{ border: 'none' }}>
                <MdListItem>
                  <MdIcon slot="start">check_circle</MdIcon>
                  <div slot="headline">Automatic returns</div>
                  <div slot="supporting-text">
                    Revenue routes to holders without human intervention
                  </div>
                </MdListItem>
                <MdDivider inset />
                <MdListItem>
                  <MdIcon slot="start">link</MdIcon>
                  <div slot="headline">Verifiable proof</div>
                  <div slot="supporting-text">
                    Every buyback has an explorer link
                  </div>
                </MdListItem>
                <MdDivider inset />
                <MdListItem>
                  <MdIcon slot="start">lock</MdIcon>
                  <div slot="headline">Immutable 90/10</div>
                  <div slot="supporting-text">
                    Split locked in contracts — forever
                  </div>
                </MdListItem>
              </MdList>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-ink relative overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 brand-gradient opacity-20 pointer-events-none"
          aria-hidden
        />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="arca-section-title mb-4">
            Invest where proof is the product
          </h2>
          <p className="text-chalk-dim text-lg mb-8 max-w-2xl mx-auto">
            Browse verified agents with live metrics and automatic buybacks.
          </p>
          <Link href="/discover">
            <MdFilledButton style={{ minWidth: 220 }}>
              <MdIcon slot="icon">explore</MdIcon>
              Explore Agents
            </MdFilledButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
