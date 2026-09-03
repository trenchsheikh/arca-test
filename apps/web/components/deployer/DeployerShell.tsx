'use client';

import { useState } from 'react';
import { DeployerSidebar } from '@/components/deployer/DeployerSidebar';
import { DeployerTopBar } from '@/components/deployer/DeployerTopBar';

export function DeployerShell({
  children,
  crumb,
}: {
  children: React.ReactNode;
  crumb: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`inv-shell${collapsed ? ' is-collapsed' : ''}`}>
      <DeployerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="inv-main">
        <DeployerTopBar crumb={crumb} />
        <div className="inv-content">{children}</div>
      </div>
    </div>
  );
}
