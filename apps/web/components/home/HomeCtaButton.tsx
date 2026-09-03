import Link from 'next/link';
import type { ReactNode } from 'react';

export function HomeCtaButton({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`home-cta-btn ${variant === 'secondary' ? 'home-cta-btn-secondary' : ''} ${className}`}
    >
      <span>{children}</span>
      {variant === 'primary' ? (
        <span className="home-cta-arrow" aria-hidden>
          →
        </span>
      ) : null}
    </Link>
  );
}
