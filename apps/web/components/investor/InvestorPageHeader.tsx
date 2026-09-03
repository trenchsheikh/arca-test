'use client';

import Image from 'next/image';

export function InvestorPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="inv-page-header">
      <div className="inv-page-header-copy">
        <h1 className="inv-page-title">{title}</h1>
        <p className="inv-page-subtitle">{subtitle}</p>
      </div>
      <div className="inv-page-actions">
        <button type="button" className="inv-btn inv-btn--ghost">
          <Image
            src="/investor/icon-arrow-up-right.svg"
            alt=""
            width={20}
            height={20}
          />
          Withdraw
        </button>
        <button type="button" className="inv-btn inv-btn--primary">
          <Image
            src="/investor/icon-arrow-deposit.svg"
            alt=""
            width={20}
            height={20}
            className="inv-btn-deposit-icon"
          />
          Deposit
        </button>
      </div>
    </div>
  );
}
