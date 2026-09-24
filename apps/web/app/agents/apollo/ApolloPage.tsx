import Image from 'next/image';
import Link from 'next/link';
import { HomeSectionDivider } from '@/components/home/HomeSectionDivider';

const steps = [
  ['Discover', 'Continuously scans active prediction markets for opportunities.'],
  ['Price', 'Forms an independent probability using market and external data.'],
  ['Compare', 'Measures Apollo’s estimate against the market-implied probability.'],
  ['Execute', 'Takes positions when the discrepancy clears its strategy and risk thresholds.'],
];
const allocation = [
  ['Trading Capital', 'Primary allocation to Apollo’s prediction-market operating treasury.'],
  ['Risk Reserve', 'Capital reserved for settlement, liquidity and drawdown management.'],
  ['Infrastructure', 'Data, inference and execution infrastructure required to operate Apollo.'],
  ['Strategy Expansion', 'Additional markets and strategies that meet its operating criteria.'],
];
const terms = [
  ['Ticker', '$APOLLO'], ['Launch FDV', '$150,000'], ['Raise Target', '$15,000 (10% FDV)'],
  ['Token Price', '$0.00015'], ['Min Ticket', '0.05 SOL'], ['Threshold', '50% of target'],
  ['Vesting Cliff', '30 days'], ['Vesting Duration', '365 days linear'],
  ['Chain', '—'], ['Status', 'COMING SOON'],
];

function Heading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <div className="ad-section-title"><Image src={icon} alt="" width={20} height={20} className="ad-section-title-icon" /><span>{children}</span></div>;
}

export function ApolloPage() {
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
          <span className="ad-breadcrumb-chip">Apollo</span>
        </nav>
        <div className="ad-hero-identity">
          <div className="ad-hero-identity-left">
            <div className="ad-agent-mark"><Image src="/featured.png" alt="" width={78} height={78} className="apollo-agent-mark-img" /></div>
            <div className="ad-hero-copy"><h1 className="ad-hero-title">Apollo</h1><p className="ad-hero-lead">Autonomous prediction agent trading probability dislocations on Polymarket.</p></div>
          </div>
          <div className="ad-hero-actions"><span className="ad-btn ad-btn-primary" aria-disabled="true">ICO coming soon</span></div>
        </div>
        <div className="ad-raise apollo-pre-ico-summary">
          <p className="ad-raise-label">Upcoming ICO</p>
          <p className="ad-raise-amount">$15,000 <span className="ad-raise-target">target · 10% allocation · $150,000 launch FDV</span></p>
          <p className="ad-raise-label">Polymarket record revealed at launch.</p>
        </div>
      </div>
      <div className="ad-stats">
        {([['Prediction P&L', '+$8,420'], ['Markets Traded', '184'], ['Win Rate', '68.5%'], ['Capital Deployed', '$24,600']] as const).map(([label,value]) =>
          <div className="ad-stat-cell" key={label}><div className="ad-stat-copy"><p className="ad-stat-label">{label}</p><p className="ad-stat-value">{value}</p></div></div>
        )}
      </div>
    </section>
    <HomeSectionDivider />
    <section className="ad-body">
      <p className="apollo-demo-note">Beta / simulated performance figures for demonstration only; these are not a verified historical record.</p>
      <div className="ad-body-row">
        <article className="ad-panel ad-panel-about">
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-info.svg">About</Heading><p className="ad-panel-text">Apollo is an autonomous prediction-market agent built to identify where market-implied probabilities diverge from its own estimates. It monitors Polymarket, analyzes relevant information, prices outcomes independently and takes positions when the discrepancy meets its strategy and risk thresholds.</p><p className="ad-panel-text">The market has a price. Apollo has a probability.</p></div>
          <div className="ad-panel-rule" aria-hidden />
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-settings.svg">Deployer</Heading><div className="ad-deployer"><div className="ad-deployer-copy"><p className="ad-deployer-handle">@arcamarkets</p><p className="ad-deployer-bio">Deployed by Arca as its first autonomous prediction agent.</p></div></div></div>
          <div className="ad-panel-rule" aria-hidden />
          <div className="ad-panel-block"><Heading icon="/agent-detail/icon-link.svg">Links</Heading><p className="ad-panel-text">Polymarket record revealed at launch.</p></div>
        </article>
        <article className="ad-panel ad-panel-contributors apollo-how-panel">
          <Heading icon="/agent-detail/icon-list.svg">How Apollo Works</Heading>
          <div className="ad-contributors">{steps.map(([title,desc],i)=><div className="ad-contributor" key={title}><div className="ad-contributor-main"><div><p className="ad-contributor-handle">{String(i+1).padStart(2,'0')} · {title}</p><p className="ad-contributor-role">{desc}</p></div></div></div>)}</div>
        </article>
      </div>
      <div className="ad-body-row">
        <div className="ad-panel-stack">
          <article className="ad-panel ad-panel-list"><Heading icon="/agent-detail/icon-list.svg">Why Capital</Heading><p className="ad-panel-text">Apollo’s opportunity set can exceed the capital available to deploy against it. Additional capital expands capacity to take simultaneous positions, diversify exposure and operate across a broader opportunity set within predefined risk parameters.</p><p className="ad-panel-text">Capital expands capacity. It does not guarantee performance.</p></article>
          <article className="ad-panel ad-panel-list"><Heading icon="/agent-detail/icon-note.svg">Capital Allocation</Heading><ul className="ad-bullet-list">{allocation.map(([name,desc])=><li key={name}><strong>{name}:</strong> {desc}</li>)}</ul></article>
        </div>
        <article className="ad-panel ad-panel-terms"><Heading icon="/agent-detail/icon-note.svg">Upcoming ICO / Deal Terms</Heading><dl className="ad-terms">{terms.map(([label,value])=><div className="ad-terms-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>
      </div>
    </section>
    <HomeSectionDivider />
  </div>;
}
