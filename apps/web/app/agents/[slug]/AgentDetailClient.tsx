'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import type { Agent, BuybackEvent } from '@/lib/mock-data';
import { TierBadge } from '@/components/TierBadge';
import { StatusPill } from '@/components/StatusPill';
import { LiveBuybackFeed } from '@/components/LiveBuybackFeed';
import { RaiseProgress } from '@/components/RaiseProgress';
import { TokenomicsChart } from '@/components/TokenomicsChart';
import { BuybackFlowDiagram } from '@/components/BuybackFlowDiagram';
import { DrawdownChart } from '@/components/DrawdownChart';
import { Countdown } from '@/components/Countdown';
import { CirculatingSupplySchedule } from '@/components/CirculatingSupplySchedule';
import { formatCurrency, formatPercent, formatNumber, formatRelativeTime, getExplorerUrl } from '@/lib/format';
import {
  MdFilledButton,
  MdOutlinedButton,
  MdIcon,
  MdList,
  MdListItem,
  MdDivider,
  MdAssistChip,
  MdChipSet,
} from '@/components/material';

interface AgentDetailClientProps {
  agent: Agent;
  buybacks: BuybackEvent[];
}

export function AgentDetailClient({ agent, buybacks }: AgentDetailClientProps) {
  const isTrading = agent.status === 'Trading';
  const isIcoLive = agent.status === 'ICO Live';

  return (
    <div className="min-h-screen">
      <section>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl"
          >
            <div className="flex items-start gap-6 mb-8">
              {agent.logoUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/15 flex-shrink-0">
                  <Image
                    src={agent.logoUrl}
                    alt={agent.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-white">
                    {agent.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="font-display font-bold text-white text-4xl sm:text-5xl">
                    {agent.name}
                  </h1>
                  <TierBadge tier={agent.tier} showTooltip />
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <StatusPill status={agent.status} />
                  <span className="text-white/70">{agent.category}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/70 capitalize">{agent.chain}</span>
                </div>

                <p className="text-white/80 text-lg mb-6">{agent.oneLiner}</p>

                <div className="flex flex-wrap gap-3">
                  {isTrading && (
                    <MdFilledButton className="hero-cta-filled">
                      <MdIcon slot="icon">candlestick_chart</MdIcon>
                      Trade on DEX
                    </MdFilledButton>
                  )}
                  {isIcoLive && (
                    <Link href={`/agents/${agent.slug}/ico`}>
                      <MdFilledButton className="hero-cta-filled">
                        <MdIcon slot="icon">payments</MdIcon>
                        Participate in ICO
                      </MdFilledButton>
                    </Link>
                  )}
                  {agent.website && (
                    <a href={agent.website} target="_blank" rel="noopener noreferrer">
                      <MdOutlinedButton className="hero-cta-outlined">
                        <MdIcon slot="icon">language</MdIcon>
                        Website
                      </MdOutlinedButton>
                    </a>
                  )}
                  {agent.docs && (
                    <a href={agent.docs} target="_blank" rel="noopener noreferrer">
                      <MdOutlinedButton className="hero-cta-outlined">
                        <MdIcon slot="icon">description</MdIcon>
                        Documentation
                      </MdOutlinedButton>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Buyback Feed - ALWAYS shown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <LiveBuybackFeed events={buybacks} agentId={agent.id} limit={5} />
            </motion.div>

            {/* Countdown for Live ICOs */}
            {isIcoLive && agent.icoEndsAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="arca-surface p-6 border-mint/20"
              >
                <h3 className="text-chalk font-semibold mb-4">ICO Ends In</h3>
                <Countdown endsAt={agent.icoEndsAt} className="justify-center" />
              </motion.div>
            )}

            {/* Performance Metrics */}
            {isTrading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="arca-surface p-6"
              >
                <h2 className="font-display font-bold text-chalk text-2xl mb-6">
                  Verified Performance
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Total Revenue</p>
                    <p className="text-chalk font-bold text-xl">
                      {formatCurrency(agent.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Trading Volume</p>
                    <p className="text-chalk font-bold text-xl">
                      {formatCurrency(agent.tradingVolume)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Win Rate</p>
                    <p className="text-mint font-bold text-xl">
                      {formatPercent(agent.winRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Avg Monthly Return</p>
                    <p className="text-mint font-bold text-xl">
                      {formatPercent(agent.avgMonthlyReturn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Capital Deployed</p>
                    <p className="text-chalk font-bold text-xl">
                      {formatCurrency(agent.capitalDeployed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Wallet Age</p>
                    <p className="text-chalk font-bold text-xl">
                      {agent.walletAge} days
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Positions</p>
                    <p className="text-chalk font-bold text-xl">
                      {formatNumber(agent.numPositions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Risk Rating</p>
                    <p className={`font-bold text-xl ${
                      agent.riskRating === 'Low' ? 'text-mint' :
                      agent.riskRating === 'Medium' ? 'text-warning' :
                      'text-error'
                    }`}>
                      {agent.riskRating}
                    </p>
                  </div>
                </div>
                
                {/* Drawdown Chart */}
                {agent.drawdownHistory && agent.drawdownHistory.length > 0 && (
                  <DrawdownChart data={agent.drawdownHistory} />
                )}
              </motion.div>
            )}

            {/* Raise Details */}
            {(isIcoLive || agent.status === 'ICO Upcoming') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display font-bold text-chalk text-2xl mb-4">
                  ICO Details
                </h2>
                <RaiseProgress
                  raised={agent.amountRaised}
                  target={agent.raiseTarget}
                  threshold={agent.raiseThreshold}
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="arca-surface p-4">
                    <p className="text-chalk-dim text-xs mb-1">Launch FDV</p>
                    <p className="text-chalk font-semibold">
                      {formatCurrency(agent.launchFdv)}
                    </p>
                  </div>
                  <div className="arca-surface p-4">
                    <p className="text-chalk-dim text-xs mb-1">Token Price</p>
                    <p className="text-chalk font-semibold">
                      ${agent.tokenPrice}
                    </p>
                  </div>
                  <div className="arca-surface p-4">
                    <p className="text-chalk-dim text-xs mb-1">Min Ticket</p>
                    <p className="text-chalk font-semibold">
                      {agent.minTicket} {agent.chain === 'solana' ? 'SOL' : 'ETH'}
                    </p>
                  </div>
                  <div className="arca-surface p-4">
                    <p className="text-chalk-dim text-xs mb-1">Raise = 10% FDV</p>
                    <p className="text-chalk font-semibold">
                      {formatCurrency(agent.raiseTarget)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vesting Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="arca-surface p-6"
            >
              <h3 className="font-semibold text-chalk text-lg mb-4">Vesting Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-chalk-dim text-sm mb-1">Vesting Cliff</p>
                  <p className="text-chalk font-semibold">{agent.vestingCliffDays} days</p>
                </div>
                <div>
                  <p className="text-chalk-dim text-sm mb-1">Vesting Duration</p>
                  <p className="text-chalk font-semibold">{agent.vestingDurationDays} days (linear)</p>
                </div>
              </div>
            </motion.div>

            {/* Tokenomics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-display font-bold text-chalk text-2xl mb-4">
                Tokenomics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="arca-surface p-4">
                  <TokenomicsChart />
                </div>
                <div className="arca-surface p-4">
                  <BuybackFlowDiagram />
                </div>
              </div>
              
              {/* Circulating Supply Schedule */}
              <CirculatingSupplySchedule 
                vestingCliffDays={agent.vestingCliffDays}
                vestingDurationDays={agent.vestingDurationDays}
              />
            </motion.div>
            
            {/* Team */}
            {agent.team && agent.team.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="arca-surface p-6"
              >
                <h2 className="font-display font-bold text-chalk text-2xl mb-6">Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agent.team.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-mint/20 to-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-chalk">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-chalk font-semibold">
                          {member.profileUrl ? (
                            <a href={member.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mint transition-colors">
                              {member.name}
                            </a>
                          ) : member.name}
                        </p>
                        <p className="text-chalk-dim text-sm">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Documents */}
            {agent.documents && agent.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="arca-surface overflow-hidden"
              >
                <h2 className="font-display font-bold text-chalk text-2xl px-6 pt-6 mb-2">
                  Documents
                </h2>
                <MdList>
                  {agent.documents.map((doc, idx) => (
                    <div key={idx}>
                      <MdListItem href={doc.url} target="_blank">
                        <MdIcon slot="start">description</MdIcon>
                        <div slot="headline">{doc.title}</div>
                        <div slot="supporting-text" className="capitalize">
                          {doc.type}
                        </div>
                        <MdIcon slot="end">open_in_new</MdIcon>
                      </MdListItem>
                      {idx < agent.documents!.length - 1 && <MdDivider />}
                    </div>
                  ))}
                </MdList>
              </motion.div>
            )}

            {/* Buyback History */}
            {isTrading && buybacks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="arca-surface p-6"
              >
                <h2 className="font-display font-bold text-chalk text-2xl mb-6">
                  Buyback History
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-chalk/10">
                        <th className="text-left text-chalk-dim text-sm font-semibold pb-3">Time</th>
                        <th className="text-left text-chalk-dim text-sm font-semibold pb-3">Revenue Spent</th>
                        <th className="text-left text-chalk-dim text-sm font-semibold pb-3">Agent Tokens</th>
                        <th className="text-left text-chalk-dim text-sm font-semibold pb-3">Platform Tokens</th>
                        <th className="text-left text-chalk-dim text-sm font-semibold pb-3">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buybacks.map((buyback) => (
                        <tr key={buyback.id} className="border-b border-chalk/5">
                          <td className="py-4 text-chalk-dim text-sm">
                            {formatRelativeTime(buyback.timestamp)}
                          </td>
                          <td className="py-4 text-chalk font-semibold">
                            {formatCurrency(buyback.revenueSpent)}
                          </td>
                          <td className="py-4 text-mint">
                            {formatNumber(buyback.agentTokensBought)}
                          </td>
                          <td className="py-4 text-gold">
                            {formatNumber(buyback.platformTokensBought)}
                          </td>
                          <td className="py-4">
                            <a
                              href={getExplorerUrl(buyback.chain, buyback.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-mint hover:text-mint-light text-sm font-mono"
                            >
                              {buyback.txHash}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="arca-surface p-6"
            >
              <h2 className="font-display font-bold text-chalk text-2xl mb-4">
                About {agent.name}
              </h2>
              <p className="text-chalk-dim leading-relaxed">
                {agent.description}
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {isTrading && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="arca-surface p-6"
              >
                <h3 className="font-display font-bold text-chalk text-lg mb-4">
                  Market Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Current Price</p>
                    <p className="text-chalk font-bold text-2xl">
                      ${agent.currentPrice.toFixed(5)}
                    </p>
                    <p className={`text-sm ${agent.priceChange24h >= 0 ? 'text-mint' : 'text-error'}`}>
                      {agent.priceChange24h >= 0 ? '+' : ''}
                      {formatPercent(agent.priceChange24h)} 24h
                    </p>
                  </div>
                  <MdDivider />
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Circulating Supply</p>
                    <p className="text-chalk font-semibold">
                      {formatNumber(agent.circulatingSupply)}
                    </p>
                  </div>
                  <MdDivider />
                  <div>
                    <p className="text-chalk-dim text-sm mb-1">Total Buybacks</p>
                    <p className="text-mint font-semibold text-lg">
                      {agent.totalBuybacks}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="arca-surface p-6"
            >
              <h3 className="font-display font-bold text-chalk text-lg mb-4">
                Resources
              </h3>
              <MdChipSet>
                {agent.website && (
                  <a href={agent.website} target="_blank" rel="noopener noreferrer">
                    <MdAssistChip label="Website">
                      <MdIcon slot="icon">language</MdIcon>
                    </MdAssistChip>
                  </a>
                )}
                {agent.docs && (
                  <a href={agent.docs} target="_blank" rel="noopener noreferrer">
                    <MdAssistChip label="Documentation">
                      <MdIcon slot="icon">description</MdIcon>
                    </MdAssistChip>
                  </a>
                )}
                {agent.twitter && (
                  <a href={agent.twitter} target="_blank" rel="noopener noreferrer">
                    <MdAssistChip label="Twitter">
                      <MdIcon slot="icon">alternate_email</MdIcon>
                    </MdAssistChip>
                  </a>
                )}
                <MdAssistChip label="Strategy Overview">
                  <MdIcon slot="icon">analytics</MdIcon>
                </MdAssistChip>
                <MdAssistChip label="Audit Report">
                  <MdIcon slot="icon">verified</MdIcon>
                </MdAssistChip>
              </MdChipSet>

              <div className="mt-6 flex flex-col gap-3">
                {isTrading && (
                  <MdFilledButton style={{ width: '100%' }}>
                    <MdIcon slot="icon">candlestick_chart</MdIcon>
                    Trade on DEX
                  </MdFilledButton>
                )}
                {isIcoLive && (
                  <Link href={`/agents/${agent.slug}/ico`} className="block">
                    <MdFilledButton style={{ width: '100%' }}>
                      <MdIcon slot="icon">payments</MdIcon>
                      Participate in ICO
                    </MdFilledButton>
                  </Link>
                )}
                {agent.website && (
                  <a
                    href={agent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <MdOutlinedButton style={{ width: '100%' }}>
                      <MdIcon slot="icon">open_in_new</MdIcon>
                      Visit Website
                    </MdOutlinedButton>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
