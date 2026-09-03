'use client';

import Image from 'next/image';
import { useState } from 'react';
import { RequireAuth } from '@/components/RequireAuth';
import { DeployerShell } from '@/components/deployer/DeployerShell';
import { DeployerPageHeader } from '@/components/deployer/DeployerPageHeader';
import { useDeployerData } from '@/components/deployer/useDeployerData';

function SettingsView() {
  const data = useDeployerData();
  const [toggles, setToggles] = useState(
    Object.fromEntries(data.settings.notifications.map((n) => [n.id, n.on])),
  );

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore clipboard failures in demo UI
    }
  };

  return (
    <DeployerShell crumb="Settings">
      <DeployerPageHeader
        title="System Settings"
        subtitle="Configure your agent deployment and notification preferences"
      />

      <div className="dep-settings-grid">
        <section className="dep-panel">
          <div className="dep-panel-toolbar">
            <div className="dep-panel-heading">
              <h2 className="inv-table-title">API & Integrations</h2>
              <span className="dep-connected-pill">
                <Image
                  src="/deployer/icon-connected.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                Connected
              </span>
            </div>
            <div className="dep-chart-controls">
              <button type="button" className="inv-more-btn" aria-label="Refresh">
                <Image src="/deployer/icon-refresh.svg" alt="" width={18} height={18} />
              </button>
              <button type="button" className="inv-more-btn" aria-label="More options">
                <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
              </button>
            </div>
          </div>

          <div className="dep-settings-list">
            <div className="dep-settings-row">
              <div>
                <span className="dep-metric-label">API Key</span>
                <span className="dep-settings-value">{data.settings.apiKey}</span>
              </div>
              <button
                type="button"
                className="dep-copy-btn"
                aria-label="Copy API key"
                onClick={() => copy(data.settings.apiKey)}
              >
                <Image src="/deployer/icon-copy.svg" alt="" width={16} height={16} />
              </button>
            </div>
            <div className="dep-settings-row">
              <div>
                <span className="dep-metric-label">Webhook URL</span>
                <span className="dep-settings-value">{data.settings.webhookUrl}</span>
              </div>
              <button
                type="button"
                className="dep-copy-btn"
                aria-label="Copy webhook URL"
                onClick={() => copy(data.settings.webhookUrl)}
              >
                <Image src="/deployer/icon-copy.svg" alt="" width={16} height={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="dep-panel">
          <div className="dep-panel-toolbar">
            <h2 className="inv-table-title">Notifications</h2>
            <div className="dep-chart-controls">
              <button type="button" className="inv-more-btn" aria-label="Refresh">
                <Image src="/deployer/icon-refresh.svg" alt="" width={18} height={18} />
              </button>
              <button type="button" className="inv-more-btn" aria-label="More options">
                <Image src="/deployer/icon-dots.svg" alt="" width={18} height={18} />
              </button>
            </div>
          </div>

          <div className="dep-settings-list">
            {data.settings.notifications.map((item) => (
              <div key={item.id} className="dep-settings-row">
                <span className="dep-settings-value">{item.label}</span>
                <button
                  type="button"
                  className={`dep-toggle${toggles[item.id] ? ' is-on' : ''}`}
                  aria-pressed={toggles[item.id]}
                  aria-label={`Toggle ${item.label}`}
                  onClick={() =>
                    setToggles((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                >
                  {toggles[item.id] ? (
                    <Image
                      src="/deployer/icon-toggle-on.svg"
                      alt=""
                      width={36}
                      height={20}
                    />
                  ) : (
                    <span className="dep-toggle-off" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="dep-panel dep-panel--danger">
        <div className="dep-danger-row">
          <div>
            <h2 className="dep-danger-title">Danger zone</h2>
            <p className="dep-danger-copy">
              Terminating deployment is irreversible. All open positions will be
              closed at market price.
            </p>
          </div>
          <div className="dep-danger-actions">
            <button type="button" className="dep-btn-pause">
              Pause Agent
            </button>
            <button type="button" className="dep-btn-terminate">
              Terminate
            </button>
          </div>
        </div>
      </section>
    </DeployerShell>
  );
}

export default function DeployerSettingsPage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <SettingsView />
    </RequireAuth>
  );
}
