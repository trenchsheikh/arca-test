'use client';

import { useState } from 'react';
import { InvestorSidebar } from '@/components/investor/InvestorSidebar';
import { InvestorTopBar } from '@/components/investor/InvestorTopBar';

export function InvestorShell({
  children,
  crumb,
}: {
  children: React.ReactNode;
  crumb: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`inv-shell${collapsed ? ' is-collapsed' : ''}`}>
      <InvestorSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="inv-main">
        <InvestorTopBar crumb={crumb} />
        <div className="inv-content">{children}</div>
      </div>
    </div>
  );
}
