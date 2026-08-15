'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { mockAgents } from '@/lib/mock-data';
import { RequireAuth } from '@/components/RequireAuth';
import {
  MdFilledButton,
  MdOutlinedButton,
  MdList,
  MdListItem,
  MdIcon,
  MdLinearProgress,
  MdDivider,
} from '@/components/material';

function DeployerDashboard() {
  // Mock deployer's agent (using quantum-flux as example)
  const myAgent = mockAgents[0];
  const raiseProgress = Math.min(myAgent.amountRaised / myAgent.raiseTarget, 1);

  return (
    <div className="arca-page">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="arca-section-title mb-2">Deployer Dashboard</h1>
              <p className="arca-page-lead">
                Monitor your agent&apos;s capital, revenue, and buyback performance
              </p>
            </div>
            <Link href="/apply">
              <MdFilledButton className="hero-cta-filled">
                <MdIcon slot="icon">add</MdIcon>
                Apply New Agent
              </MdFilledButton>
            </Link>
          </div>
        </motion.div>

        <div className="arca-surface p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-brand/10 text-brand">
              <span className="text-2xl font-bold">{myAgent.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-chalk text-2xl">
                {myAgent.name}
              </h2>
              <p className="text-chalk-dim">
                {myAgent.category} · {myAgent.status}
              </p>
            </div>
            <Link href={`/agents/${myAgent.slug}`}>
              <MdOutlinedButton>
                <MdIcon slot="icon">open_in_new</MdIcon>
                View Public Page
              </MdOutlinedButton>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-chalk-dim">Raise progress</span>
              <span className="text-brand font-semibold">
                {formatPercent(raiseProgress)} of target
              </span>
            </div>
            <MdLinearProgress
              value={raiseProgress}
              max={1}
              style={{ width: '100%', height: 8 }}
            />
          </div>
        </div>

        <div className="arca-surface mb-8 overflow-hidden">
          <MdList>
            <MdListItem>
              <MdIcon slot="start">savings</MdIcon>
              <div slot="overline">Capital Raised</div>
              <div slot="headline">{formatCurrency(myAgent.amountRaised)}</div>
              <div slot="supporting-text">
                {formatPercent(myAgent.amountRaised / myAgent.raiseTarget)} of target
              </div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">account_balance_wallet</MdIcon>
              <div slot="overline">Operational Wallet</div>
              <div slot="headline">{formatCurrency(myAgent.capitalDeployed)}</div>
              <div slot="supporting-text">Available for trading</div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">payments</MdIcon>
              <div slot="overline">Revenue Generated</div>
              <div slot="headline">{formatCurrency(myAgent.totalRevenue)}</div>
              <div slot="supporting-text">All time</div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">autorenew</MdIcon>
              <div slot="overline">Buybacks Executed</div>
              <div slot="headline">{myAgent.totalBuybacks}</div>
              <div slot="supporting-text">
                {formatCurrency(myAgent.totalRevenue * 0.9)} total volume
              </div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">show_chart</MdIcon>
              <div slot="overline">Current Token Price</div>
              <div slot="headline">${myAgent.currentPrice.toFixed(5)}</div>
              <div slot="supporting-text">
                {myAgent.priceChange24h >= 0 ? '+' : ''}
                {formatPercent(myAgent.priceChange24h)} 24h
              </div>
            </MdListItem>
            <MdDivider />
            <MdListItem>
              <MdIcon slot="start">token</MdIcon>
              <div slot="overline">Circulating Supply</div>
              <div slot="headline">{formatNumber(myAgent.circulatingSupply)}</div>
              <div slot="supporting-text">50% of total supply</div>
            </MdListItem>
          </MdList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="arca-surface overflow-hidden">
            <div className="px-6 pt-6">
              <h3 className="font-display font-bold text-chalk text-xl">
                Performance Metrics
              </h3>
            </div>
            <MdList>
              <MdListItem>
                <MdIcon slot="start">emoji_events</MdIcon>
                <div slot="headline">Win Rate</div>
                <div slot="trailing-supporting-text">
                  {formatPercent(myAgent.winRate)}
                </div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">calendar_month</MdIcon>
                <div slot="headline">Avg Monthly Return</div>
                <div slot="trailing-supporting-text">
                  {formatPercent(myAgent.avgMonthlyReturn)}
                </div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">bar_chart</MdIcon>
                <div slot="headline">Trading Volume</div>
                <div slot="trailing-supporting-text">
                  {formatCurrency(myAgent.tradingVolume)}
                </div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">layers</MdIcon>
                <div slot="headline">Total Positions</div>
                <div slot="trailing-supporting-text">
                  {formatNumber(myAgent.numPositions)}
                </div>
              </MdListItem>
            </MdList>
          </div>

          <div className="arca-surface p-6">
            <h3 className="font-display font-bold text-chalk text-xl mb-6">
              Fee Revenue (Deployer Share)
            </h3>
            <p className="text-chalk-dim text-sm mb-2">Total Earned (50% of 1% fee)</p>
            <p className="text-brand font-bold text-3xl mb-4">
              {formatCurrency(myAgent.tradingVolume * 0.01 * 0.5)}
            </p>
            <MdDivider />
            <p className="text-chalk-dim text-sm mt-4">
              You earn 50% of the 1% trading fee. The other 50% goes to Arca treasury
              (not to buybacks).
            </p>
          </div>

          <div className="arca-surface p-6 buyback-glow border-brand/30 lg:col-span-2">
            <h3 className="font-display font-bold text-chalk text-xl mb-4">
              Buyback Engine Status
            </h3>
            <MdList>
              <MdListItem>
                <MdIcon slot="start">currency_exchange</MdIcon>
                <div slot="overline">Revenue to Buyback</div>
                <div slot="headline">
                  {formatCurrency(myAgent.totalRevenue * 0.9)}
                </div>
                <div slot="supporting-text">90% of revenue</div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">shopping_cart</MdIcon>
                <div slot="overline">Tokens Bought Back</div>
                <div slot="headline">
                  {formatNumber(
                    (myAgent.totalRevenue * 0.9) / myAgent.currentPrice * 10000,
                  )}
                </div>
                <div slot="supporting-text">From open market</div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">schedule</MdIcon>
                <div slot="overline">Last Buyback</div>
                <div slot="headline">
                  {myAgent.lastBuybackTime ? '15m ago' : 'N/A'}
                </div>
                <div slot="supporting-text">Automatic execution</div>
              </MdListItem>
            </MdList>
            <p className="text-chalk-dim text-sm mt-4">
              <strong className="text-chalk">Immutable split:</strong> 90% agent token
              buyback + 10% platform token buyback. You cannot modify this post launch.
              All buybacks are recorded on chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  return (
    <RequireAuth title="Sign In To Access Deployer Dashboard">
      <DeployerDashboard />
    </RequireAuth>
  );
}
