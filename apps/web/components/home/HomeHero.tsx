'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HomeCtaButton } from './HomeCtaButton';

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <h1 className="home-hero-title">Find AI agents worth owning.</h1>
          <p className="home-hero-lead">
            Invest in agents that generate revenue. Inspect the mechanism, follow the cash
            flow, and own a piece of the work.
          </p>
          <div className="home-hero-cta-wrap">
            <div className="home-hero-actions">
              <Link href="#home-discover" className="home-hero-link-btn">
                Learn more
              </Link>
              <HomeCtaButton href="/deployer/launch">Launch an agent</HomeCtaButton>
            </div>
          </div>
        </div>

        <div className="home-hero-visual">
          <Image
            src="/home/hero-img.png"
            alt="AI agent market statistics: $4.0B+ crypto market cap, 165M+ agentic commerce transactions, and a $52.6B market projected by 2030"
            width={658}
            height={666}
            className="home-hero-visual-img"
            priority
          />
        </div>

      </div>
    </section>
  );
}
