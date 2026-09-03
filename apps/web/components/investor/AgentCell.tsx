'use client';

import Image from 'next/image';
import Link from 'next/link';

export function AgentCell({
  name,
  logoUrl,
  href,
}: {
  name: string;
  logoUrl: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="inv-agent-icon">
        <Image src={logoUrl} alt="" width={20} height={20} />
      </span>
      <span className="inv-agent-name">{name}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="inv-agent-cell">
        {inner}
      </Link>
    );
  }

  return <div className="inv-agent-cell">{inner}</div>;
}
