'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { DeployerShell } from '@/components/deployer/DeployerShell';
import { DeployerPageHeader } from '@/components/deployer/DeployerPageHeader';
import { LaunchAgentWizard } from '@/components/launch/LaunchAgentWizard';

function LaunchView() {
  return (
    <DeployerShell crumb="Launch an agent">
      <DeployerPageHeader
        title="Launch an agent"
        subtitle="Submit your AI agent for review. Admin approval is required before ICO launch."
      />
      <div className="launch-page-body">
        <LaunchAgentWizard />
      </div>
    </DeployerShell>
  );
}

export default function DeployerLaunchPage() {
  return (
    <RequireAuth title="Sign In To Launch An Agent">
      <LaunchView />
    </RequireAuth>
  );
}
