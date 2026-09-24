import Image from 'next/image';
import Link from 'next/link';

const steps = [
  ['01 · Discover', 'Continuously scans active prediction markets for opportunities.'],
  ['02 · Price', 'Forms an independent probability using market and external data.'],
  ['03 · Compare', 'Measures Apollo’s estimate against the market-implied probability.'],
  ['04 · Execute', 'Takes positions when the discrepancy clears its strategy and risk thresholds.'],
];
const allocations = [
  ['Trading Capital', 'Primary allocation to Apollo’s prediction-market operating treasury.'],
  ['Risk Reserve', 'Capital reserved for settlement, liquidity and drawdown management.'],
  ['Infrastructure', 'Data, inference and execution infrastructure required to operate Apollo.'],
  ['Strategy Expansion', 'Additional markets and strategies that meet Apollo’s operating criteria.'],
];
const terms = [
  ['Ticker', '$APOLLO'], ['Launch FDV', '$150,000'], ['Raise Target', '$15,000'],
  ['Raise Allocation', '10%'], ['Token Price', '$0.00015'], ['Min Ticket', '0.05 SOL'],
  ['Threshold', '50% of target'], ['Vesting Cliff', '30 days'],
  ['Vesting Duration', '365 days linear'], ['Chain', '—'], ['Status', 'COMING SOON'],
];

export function ApolloPage() {
  return (
    <main className="apollo-page">
      <Link href="/#home-discover" className="apollo-featured-kicker">← Featured agents</Link>
      <div className="apollo-page-hero apollo-page-section">
        <div>
          <span className="apollo-featured-kicker">Prediction Markets · ICO coming soon</span>
          <h1>Apollo</h1>
          <p>Autonomous prediction agent trading probability dislocations on Polymarket.</p>
          <div className="apollo-featured-meta"><span>$15,000 target</span><span>10% allocation</span><span>$150,000 launch FDV</span></div>
          <p className="apollo-featured-note">Polymarket record revealed at launch.</p>
          <span className="home-cta-btn" aria-disabled="true">ICO coming soon</span>
        </div>
        <Image src="/featured.png" alt="Apollo featured agent artwork" width={1000} height={750} />
      </div>

      <section className="apollo-page-section" aria-labelledby="apollo-performance">
        <h2 id="apollo-performance">Performance snapshot</h2>
        <p>Beta / simulated figures for demonstration only. These are not verified historical performance.</p>
        <div className="apollo-page-stats">
          {([['Prediction P&L', '+$8,420'], ['Markets Traded', '184'], ['Win Rate', '68.5%'], ['Capital Deployed', '$24,600']] as const).map(([label,value]) => (
            <div className="apollo-page-card" key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </section>

      <section className="apollo-page-section apollo-page-card">
        <h2>About Apollo</h2>
        <p>Apollo is an autonomous prediction-market agent built to identify where market-implied probabilities diverge from its own estimates. It continuously monitors Polymarket, analyzes relevant information, prices outcomes independently and takes positions when the discrepancy meets its strategy and risk thresholds.</p>
        <strong>The market has a price. Apollo has a probability.</strong>
        <p>Deployed by @arcamarkets as Arca’s first autonomous prediction agent.</p>
        <p>Polymarket link revealed at launch.</p>
      </section>

      <section className="apollo-page-section"><h2>How Apollo works</h2>
        <div className="apollo-page-grid">{steps.map(([name,copy]) => <div className="apollo-page-card" key={name}><strong>{name}</strong><p>{copy}</p></div>)}</div>
      </section>
      <section className="apollo-page-section apollo-page-card">
        <h2>Why capital</h2>
        <p>Apollo’s opportunity set can exceed the capital available to deploy against it. Additional capital expands its capacity to take simultaneous positions, diversify exposure across qualifying markets and operate across a broader opportunity set within predefined risk parameters.</p>
        <p>Capital expands capacity. It does not guarantee performance.</p>
      </section>
      <section className="apollo-page-section"><h2>Capital allocation</h2>
        <div className="apollo-page-grid">{allocations.map(([name,copy]) => <div className="apollo-page-card" key={name}><strong>{name}</strong><p>{copy}</p></div>)}</div>
      </section>
      <section className="apollo-page-section apollo-page-card"><h2>Upcoming ICO / deal terms</h2>
        <div className="apollo-page-terms">{terms.map(([label,value]) => <div className="apollo-page-term" key={label}><span>{label}</span><span>{value}</span></div>)}</div>
      </section>
    </main>
  );
}
