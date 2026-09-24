'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HomeSectionDivider } from '@/components/home/HomeSectionDivider';
import type { PreIcoAgent } from '@/lib/pre-ico-agents';

function Heading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <div className="ad-section-title"><Image src={icon} alt="" width={20} height={20} className="ad-section-title-icon" /><span>{children}</span></div>;
}

export function PreIcoAgentDetailClient({ agent }: { agent: PreIcoAgent }) {
  return <div className="ad-page">
    <HomeSectionDivider />
    <section className="ad-hero">
      <div className="ad-hero-bg" aria-hidden>
        <div className="ad-hero-bg-pattern" style={{ backgroundImage: 'url(/agent-detail/hero-bg.png)' }} />
        <div className="ad-hero-bg-wash" />
      </div>
      <div className="ad-hero-inner">
        <nav className="ad-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="ad-breadcrumb-chip">Discover</Link>
          <Image src="/agent-detail/icon-breadcrumb.svg" alt="" width={10} height={20} className="ad-breadcrumb-sep" />
          <span className="ad-breadcrumb-chip">{agent.name}</span>
        </nav>
        <div className="ad-hero-identity">
          <div className="ad-hero-identity-left">
            <div className="ad-agent-mark"><Image src={agent.artwork} alt="" width={78} height={78} className="apollo-agent-mark-img" /></div>
            <div className="ad-hero-copy"><h1 className="ad-hero-title">{agent.name}</h1><p className="ad-hero-lead">{agent.subtitle}</p></div>
          </div>
          <div className="ad-hero-actions"><span className="ad-btn ad-btn-primary" aria-disabled="true">ICO coming soon</span></div>
        </div>
        <div className="ad-raise apollo-apollo-pre-ico-summary">
          <p className="ad-raise-label">Upcoming ICO</p>
          <p className="ad-raise-amount">{agent.raiseTarget} <span className="ad-raise-target">target · {agent.raiseAllocation} allocation · {agent.launchFdv} launch FDV</span></p>
          <p className="ad-raise-label">{agent.recordNote}</p>
        </div>
      </div>
      <div className="ad-stats">
        {agent.performance.map(([label,value]) =>
          <div className="ad-stat-cell" key={label}><div className="ad-stat-copy"><p className="ad-stat-label">{label}</p><p className="ad-stat-value">{value}</p></div></div>
        )}
      </div>
    </section>
    <HomeSectionDivider />
    <section className="ad-body">
      <p className="apollo-demo-note">Beta / simulated performance figures for demonstration only; these are not a verified historical record.</p>
      <div className="ad-body-row">
        <article className="ad-panel ad-panel-about">
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-info.svg">About</Heading><p className="ad-panel-text">{agent.description}</p><p className="ad-panel-text">{agent.thesis}</p></div>
          <div className="ad-panel-rule" aria-hidden />
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-settings.svg">Deployer</Heading><div className="ad-deployer"><div className="ad-deployer-copy"><p className="ad-deployer-handle">{agent.deployer}</p><p className="ad-deployer-bio">{agent.deployerBio}</p></div></div></div>
          <div className="ad-panel-rule" aria-hidden />
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-link.svg">Links</Heading><p className="ad-panel-text">{agent.recordNote}</p></div>
        </article>
        <article className="ad-panel ad-panel-contributors apollo-how-panel">
          <Heading icon="/agent-detail/icon-list.svg">How {agent.name} Works</Heading>
          <div className="ad-contributors">{agent.steps.map(([title,desc],i)=><div className="ad-contributor" key={title}><div className="ad-contributor-main"><div><p className="ad-contributor-handle">{String(i+1).padStart(2,'0')} · {title}</p><p className="ad-contributor-role">{desc}</p></div></div></div>)}</div>
        </article>
      </div>
      <div className="ad-body-row">
        <div className="ad-panel-stack">
          <article className="ad-panel ad-panel-list"><Heading icon="/agent-detail/icon-list.svg">Why Capital</Heading><p className="ad-panel-text">{agent.whyCapital}</p><p className="ad-panel-text">{agent.capitalCaveat}</p></article>
          <article className="ad-panel ad-panel-list"><Heading icon="/agent-detail/icon-note.svg">Capital Allocation</Heading><ul className="ad-bullet-list">{agent.allocation.map(([name,desc])=><li key={name}><strong>{name}:</strong> {desc}</li>)}</ul></article>
        </div>
        <article className="ad-panel ad-panel-terms"><Heading icon="/agent-detail/icon-note.svg">Upcoming ICO / Deal Terms</Heading><dl className="ad-terms">{agent.terms.map(([label,value])=><div className="ad-terms-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
      </div>
    </section>
    <HomeSectionDivider />
  </div>;
}
