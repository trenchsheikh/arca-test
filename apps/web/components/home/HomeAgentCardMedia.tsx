import Image from 'next/image';
import type { Agent } from '@/lib/mock-data';

export function HomeAgentCardMedia({
  agent,
  variant = 'grid',
  className = '',
}: {
  agent: Agent;
  variant?: 'featured' | 'grid';
  className?: string;
}) {
  const leftBadge = variant === 'featured' ? 'Featured' : 'TRADING';
  const rightBadge = 'Live';

  return (
    <div className={`home-agent-media ${className}`}>
      <div aria-hidden className="home-agent-media-bg" />

      <span className="home-agent-badge home-agent-badge-left">{leftBadge}</span>
      <span className="home-agent-badge home-agent-badge-right">{rightBadge}</span>

      <div className="home-agent-media-mark">
        <span aria-hidden className="home-agent-mark-glow" />
        <span className="home-agent-mark-bracket home-agent-mark-bracket-tl" />
        <span className="home-agent-mark-bracket home-agent-mark-bracket-bl" />
        <span className="home-agent-mark-bracket home-agent-mark-bracket-tr" />
        <span className="home-agent-mark-bracket home-agent-mark-bracket-br" />
        <span className="home-agent-mark-icon">
          <Image
            src={agent.logoUrl}
            alt=""
            width={40}
            height={40}
            className="h-[70%] w-[70%] object-contain opacity-80"
          />
        </span>
      </div>
    </div>
  );
}
