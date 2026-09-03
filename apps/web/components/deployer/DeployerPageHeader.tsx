'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DeployerPageHeader({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status?: string;
}) {
  const pathname = usePathname();
  const onLaunch = pathname.startsWith('/deployer/launch');

  return (
    <div className="inv-page-header">
      <div className="inv-page-header-copy">
        <h1 className="inv-page-title">{title}</h1>
        <div className="dep-page-meta">
          <p className="inv-page-subtitle">{subtitle}</p>
          {status ? (
            <span className="dep-status-pill">
              <Image
                src="/deployer/icon-raising.svg"
                alt=""
                width={14}
                height={14}
              />
              {status}
            </span>
          ) : null}
        </div>
      </div>
      {!onLaunch ? (
        <div className="inv-page-actions">
          <Link href="/deployer/launch" className="inv-btn inv-btn--primary">
            Launch an agent
            <Image
              src="/deployer/icon-arrow-up-right.svg"
              alt=""
              width={20}
              height={20}
            />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
