'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Agent } from '@/lib/mock-data';
import { RaiseProgress } from '@/components/RaiseProgress';
import { Countdown } from '@/components/Countdown';
import { LoadingState } from '@/components/LoadingState';
import { formatCurrency } from '@/lib/format';
import { tokensForContributionPreview } from '@arca/shared';
import { useAuth } from '@/components/AuthProvider';
import {
  MdOutlinedTextField,
  MdFilledButton,
  MdOutlinedButton,
  MdTextButton,
  MdIcon,
  MdList,
  MdListItem,
  MdDivider,
  MdCircularProgress,
} from '@/components/material';

export default function IcoPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { isAuthenticated, wallet: authWallet } = useAuth();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [contributing, setContributing] = useState(false);
  const [tokensAllocated, setTokensAllocated] = useState<number | null>(null);
  const [hasContributed, setHasContributed] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && authWallet && !wallet) {
      setWallet(authWallet);
    }
  }, [isAuthenticated, authWallet, wallet]);

  const fetchAgent = useCallback(async () => {
    if (!slug) return;
    try {
      const response = await fetch(`/api/agents/${slug}`);
      const data = await response.json();
      if (data.agent) {
        setAgent(data.agent);
      }
    } catch (err) {
      console.error('Failed to fetch agent:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchAgent();
    const interval = setInterval(fetchAgent, 10000);
    return () => clearInterval(interval);
  }, [fetchAgent]);

  useEffect(() => {
    if (!wallet.trim() || !agent) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/investor/portfolio?wallet=${encodeURIComponent(wallet.trim())}`,
        );
        const data = await res.json();
        if (cancelled) return;
        const pos = (data.positions || []).find(
          (p: { agentId: string }) => p.agentId === agent.id,
        );
        if (pos) setHasContributed(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet, agent?.id]);

  if (loading) {
    return (
      <div className="arca-page flex items-center justify-center">
        <LoadingState label="Loading ICO…" className="min-h-[50vh]" onBrand />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="arca-page flex items-center justify-center">
        <div className="arca-surface">
          <MdList>
            <MdListItem>
              <MdIcon slot="start">search_off</MdIcon>
              <div slot="headline">Agent not found</div>
              <div slot="supporting-text">Check the URL or return to discover</div>
            </MdListItem>
          </MdList>
        </div>
      </div>
    );
  }

  const isLive = agent.status === 'ICO Live';
  const canClaim =
    hasContributed &&
    (agent.status === 'Successful' || agent.status === 'Trading');
  const canRefund = hasContributed && agent.status === 'Failed';

  const amountNum = parseFloat(amount);
  const tokensToReceive =
    amount && amountNum > 0
      ? tokensForContributionPreview(amountNum, agent.raiseTarget)
      : 0;

  const handleContribute = async () => {
    if (!wallet.trim() || !amount || amountNum < agent.minTicket) return;

    setContributing(true);
    setError(null);
    setActionMsg(null);

    try {
      const response = await fetch(`/api/agents/${agent.slug}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: wallet.trim(),
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Contribution failed');
      }

      setHasContributed(true);
      setTokensAllocated(data.tokensAllocated);
      setAgent(data.agent);
      setAmount('');
      setActionMsg(
        `Contribution successful · ${Number(data.tokensAllocated).toLocaleString()} tokens allocated`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contribution failed');
    } finally {
      setContributing(false);
    }
  };

  const handleClaim = async () => {
    setError(null);
    try {
      const response = await fetch(`/api/agents/${agent.slug}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Claim failed');
      }
      setActionMsg(
        `Claimed ${Number(data.position.tokensAllocated).toLocaleString()} tokens`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    }
  };

  const handleRefund = async () => {
    setError(null);
    try {
      const response = await fetch(`/api/agents/${agent.slug}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Refund failed');
      }
      setActionMsg(
        `Refunded ${formatCurrency(data.position.contributed)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refund failed');
    }
  };

  return (
    <div className="arca-page">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href={`/agents/${agent.slug}`} className="inline-block mb-6">
            <MdTextButton className="hero-cta-outlined">
              <MdIcon slot="icon">arrow_back</MdIcon>
              Back To {agent.name}
            </MdTextButton>
          </Link>

          <h1 className="arca-section-title mb-2">Participate In ICO</h1>
          <p className="arca-page-lead text-xl mb-8">
            {agent.name} · {agent.category} · {agent.status}
          </p>
        </motion.div>

        {agent.tier === 'Pro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 arca-surface-muted p-4 border-brand/30"
          >
            <p className="text-brand text-sm font-semibold">
              Priority access for Arca platform token holders
            </p>
          </motion.div>
        )}

        {agent.icoEndsAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 arca-surface p-6"
          >
            <h3 className="text-chalk font-semibold text-center mb-4">ICO Ends In</h3>
            <Countdown endsAt={agent.icoEndsAt} className="justify-center" />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="arca-surface p-6">
              <h2 className="font-display font-bold text-chalk text-xl mb-6">
                Contribute
              </h2>

              <div className="space-y-4">
                <div>
                  <MdOutlinedTextField
                    label="Wallet address"
                    value={wallet}
                    readOnly
                    style={{ width: '100%' }}
                  >
                    <MdIcon slot="leading-icon">account_balance_wallet</MdIcon>
                  </MdOutlinedTextField>
                  {!isAuthenticated && (
                    <p className="text-chalk-dim text-sm mt-2">
                      Connect your Solana wallet to contribute.
                    </p>
                  )}
                </div>

                {actionMsg && (
                  <div className="arca-surface-muted p-4 text-sm text-brand">
                    {actionMsg}
                    {tokensAllocated != null && (
                      <span className="block mt-1 font-semibold">
                        Tokens allocated: {tokensAllocated.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-sm text-error">
                    {error}
                  </div>
                )}

                {canClaim && (
                  <MdFilledButton
                    onClick={handleClaim}
                    style={{ width: '100%' }}
                  >
                    <MdIcon slot="icon">redeem</MdIcon>
                    Claim Tokens
                  </MdFilledButton>
                )}

                {canRefund && (
                  <MdOutlinedButton
                    onClick={handleRefund}
                    style={{ width: '100%' }}
                  >
                    <MdIcon slot="icon">undo</MdIcon>
                    Claim Refund
                  </MdOutlinedButton>
                )}

                {isLive && !canClaim && !canRefund && (
                  <>
                    <MdOutlinedTextField
                      label="Amount (USD)"
                      type="number"
                      value={amount}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onInput={(e: any) => setAmount(e.target.value)}
                      placeholder={`Min: $${agent.minTicket}`}
                      min={String(agent.minTicket)}
                      step="0.01"
                      style={{ width: '100%' }}
                    >
                      <MdIcon slot="leading-icon">attach_money</MdIcon>
                    </MdOutlinedTextField>

                    <div className="arca-surface-muted p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-chalk-dim text-sm">
                          Estimated tokens (10% presale bucket)
                        </span>
                        <span className="text-brand font-bold text-xl">
                          {tokensToReceive.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-chalk-dim">Token price</span>
                        <span className="text-chalk">
                          ${agent.tokenPrice.toFixed(6)}
                        </span>
                      </div>
                      <p className="text-chalk-dim text-xs mt-2">
                        Live allocation preview via tokensForContributionPreview
                      </p>
                    </div>

                    {amount !== '' && amountNum < agent.minTicket && (
                      <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-sm text-error">
                        Minimum contribution is ${agent.minTicket}
                      </div>
                    )}

                    <MdFilledButton
                      onClick={handleContribute}
                      disabled={
                        !wallet.trim() ||
                        !amount ||
                        amountNum < agent.minTicket ||
                        contributing
                      }
                      style={{ width: '100%' }}
                    >
                      {contributing ? (
                        <MdCircularProgress
                          indeterminate
                          slot="icon"
                          style={{ width: 20, height: 20 }}
                        />
                      ) : (
                        <MdIcon slot="icon">payments</MdIcon>
                      )}
                      {contributing
                        ? 'Contributing...'
                        : `Contribute $${amount || '0'}`}
                    </MdFilledButton>
                  </>
                )}

                {!isLive && !canClaim && !canRefund && (
                  <p className="text-chalk-dim text-sm">
                    ICO is not live. Current status: {agent.status}
                  </p>
                )}
              </div>
            </div>

            <div className="arca-surface p-6">
              <h3 className="font-semibold text-chalk mb-2">ICO Terms</h3>
              <MdList>
                <MdListItem>
                  <MdIcon slot="start">token</MdIcon>
                  <div slot="supporting-text">
                    Tokens from 10% presale bucket distributed at ICO close if
                    threshold met
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">undo</MdIcon>
                  <div slot="supporting-text">Refunds if threshold not met</div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">flag</MdIcon>
                  <div slot="supporting-text">
                    {(agent.raiseThreshold * 100).toFixed(0)}% minimum threshold
                    required for success
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">attach_money</MdIcon>
                  <div slot="supporting-text">
                    All amounts in USD (demo units matching raise target)
                  </div>
                </MdListItem>
              </MdList>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <RaiseProgress
              raised={agent.amountRaised}
              target={agent.raiseTarget}
              threshold={agent.raiseThreshold}
            />

            <div className="arca-surface overflow-hidden">
              <div className="px-6 pt-6">
                <h3 className="font-semibold text-chalk">ICO Details</h3>
              </div>
              <MdList>
                <MdListItem>
                  <MdIcon slot="start">apartment</MdIcon>
                  <div slot="headline">Launch FDV</div>
                  <div slot="trailing-supporting-text">
                    {formatCurrency(agent.launchFdv)}
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">flag</MdIcon>
                  <div slot="headline">Raise Target</div>
                  <div slot="trailing-supporting-text">
                    {formatCurrency(agent.raiseTarget)} (10%)
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">confirmation_number</MdIcon>
                  <div slot="headline">Min Ticket</div>
                  <div slot="trailing-supporting-text">${agent.minTicket}</div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">link</MdIcon>
                  <div slot="headline">Chain</div>
                  <div slot="trailing-supporting-text">
                    {agent.chain}
                  </div>
                </MdListItem>
                <MdDivider />
                <MdListItem>
                  <MdIcon slot="start">all_inclusive</MdIcon>
                  <div slot="headline">Total Supply</div>
                  <div slot="trailing-supporting-text">1,000,000,000</div>
                </MdListItem>
              </MdList>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
