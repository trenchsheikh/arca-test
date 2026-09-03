'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export function AdminShell({
  children,
  crumb,
}: {
  children: React.ReactNode;
  crumb: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`inv-shell${collapsed ? ' is-collapsed' : ''}`}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="inv-main">
        <AdminTopBar crumb={crumb} />
        <div className="inv-content">{children}</div>
      </div>
    </div>
  );
}
