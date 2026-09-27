'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HomeSectionDivider } from '@/components/home/HomeSectionDivider';
import type { PreIcoAgent } from '@/lib/pre-ico-agents';

function Heading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <div className="agd-section-title"><Image src={icon} alt="" width={20} height={20} className="agd-section-title-icon" /><span>{children}</span></div>;
}

export function PreIcoAgentDetailClient({ agent }: { agent: PreIcoAgent }) {
  return <div className="agd-page">
    <HomeSectionDivider />
    <section className="agd-hero">
      <div className="agd-hero-bg" aria-hidden>
        <div className="agd-hero-bg-pattern" style={{ backgroundImage: 'url(/agent-detail/hero-bg.png)' }} />
        <div className="agd-hero-bg-wash" />
      </div>
      <div className="agd-hero-inner">
        <nav className="agd-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="agd-breadcrumb-chip">Discover</Link>
          <Image src="/agent-detail/icon-breadcrumb.svg" alt="" width={10} height={20} className="agd-breadcrumb-sep" />
          <span className="agd-breadcrumb-chip">{agent.name}</span>
        </nav>
        <div className="agd-hero-identity">
          <div className="agd-hero-identity-left">
            <div className="agd-agent-mark"><Image src={agent.artwork} alt="" width={78} height={78} className="apollo-agent-mark-img" /></div>
            <div className="agd-hero-copy"><h1 className="agd-hero-title">{agent.name}</h1><p className="agd-hero-lead">{agent.subtitle}</p></div>
          </div>
          <div className="agd-hero-actions"><span className="agd-btn agd-btn-primary" aria-disabled="true">ICO coming soon</span></div>
        </div>
        <div className="agd-raise apollo-pre-ico-summary">
          <p className="agd-raise-label">Upcoming ICO</p>
          <p className="agd-raise-amount">{agent.raiseTarget} <span className="agd-raise-target">target · {agent.raiseAllocation} allocation · {agent.launchFdv} launch FDV</span></p>
          <p className="agd-raise-label">{agent.recordNote}</p>
        </div>
      </div>
      <div className="agd-stats">
        {agent.performance.map(([label,value]) =>
          <div className="agd-stat-cell" key={label}><div className="agd-stat-copy"><p className="agd-stat-label">{label}</p><p className="agd-stat-value">{value}</p></div></div>
        )}
      </div>
    </section>
    <HomeSectionDivider />
    <section className="agd-body">
      <p className="apollo-demo-note">Beta / simulated performance figures for demonstration only; these are not a verified historical record.</p>
      <div className="agd-body-row">
        <article className="agd-panel agd-panel-about">
          <div className="agd-panel-block"><Heading icon="/agent-detail/icon-info.svg">About</Heading><p className="agd-panel-text">{agent.description}</p><p className="agd-panel-text">{agent.thesis}</p></div>
          <div className="agd-panel-rule" aria-hidden />
          <div className="agd-panel-block"><Heading icon="/agent-detail/icon-settings.svg">Deployer</Heading><div className="agd-deployer"><div className="agd-deployer-copy"><p className="agd-deployer-handle">{agent.deployer}</p><p className="agd-deployer-bio">{agent.deployerBio}</p></div></div></div>
          <div className="agd-panel-rule" aria-hidden />
          <div className="agd-panel-block"><Heading icon="/agent-detail/icon-link.svg">Links</Heading><p className="agd-panel-text">{agent.recordNote}</p></div>
        </article>
        <article className="agd-panel agd-panel-contributors apollo-how-panel">
          <Heading icon="/agent-detail/icon-list.svg">How {agent.name} Works</Heading>
          <div className="agd-contributors">{agent.steps.map(([title,desc],i)=><div className="agd-contributor" key={title}><div className="agd-contributor-main"><div><p className="agd-contributor-handle">{String(i+1).padStart(2,'0')} · {title}</p><p className="agd-contributor-role">{desc}</p></div></div></div>)}</div>
        </article>
      </div>
      <div className="agd-body-row">
        <div className="agd-panel-stack">
          <article className="agd-panel agd-panel-list"><Heading icon="/agent-detail/icon-list.svg">Why Capital</Heading><p className="agd-panel-text">{agent.whyCapital}</p><p className="agd-panel-text">{agent.capitalCaveat}</p></article>
          <article className="agd-panel agd-panel-list"><Heading icon="/agent-detail/icon-note.svg">Capital Allocation</Heading><ul className="agd-bullet-list">{agent.allocation.map(([name,desc])=><li key={name}><strong>{name}:</strong> {desc}</li>)}</ul></article>
        </div>
        <article className="agd-panel agd-panel-terms"><Heading icon="/agent-detail/icon-note.svg">Upcoming ICO / Deal Terms</Heading><dl className="agd-terms">{agent.terms.map(([label,value])=><div className="agd-terms-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
      </div>
    </section>
    <HomeSectionDivider />
  </div>;
}
