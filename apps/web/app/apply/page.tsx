'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth } from '@/components/RequireAuth';
import {
  MdFilledButton,
  MdOutlinedButton,
  MdTextButton,
  MdOutlinedTextField,
  MdOutlinedSelect,
  MdSelectOption,
  MdCheckbox,
  MdLinearProgress,
  MdChipSet,
  MdFilterChip,
  MdList,
  MdListItem,
  MdIcon,
  MdSlider,
  MdCircularProgress,
  MdDivider,
} from '@/components/material';

type Step = 'profile' | 'revenue' | 'ico' | 'preview';
type Category = 'Trading' | 'Prediction' | 'Arbitrage' | 'Research' | 'Other';
type Chain = 'solana' | 'robinhood';

interface TeamMember {
  name: string;
  role: string;
  profileUrl: string;
}

interface DocumentMeta {
  type: 'strategy' | 'audit' | 'other';
  title: string;
  url: string;
}

interface FormState {
  name: string;
  description: string;
  logoUrl: string;
  category: Category;
  website: string;
  docs: string;
  twitter: string;
  team: TeamMember[];
  chain: Chain;
  revenueWallet: string;
  launchFdv: number;
  threshold: number;
  cliffDays: number;
  durationDays: number;
  documents: DocumentMeta[];
  acknowledge: boolean;
  submittedAppId: string | null;
}

const CATEGORIES: Category[] = [
  'Trading',
  'Prediction',
  'Arbitrage',
  'Research',
  'Other',
];

const initialForm: FormState = {
  name: '',
  description: '',
  logoUrl: '',
  category: 'Trading',
  website: '',
  docs: '',
  twitter: '',
  team: [{ name: '', role: '', profileUrl: '' }],
  chain: 'solana',
  revenueWallet: '',
  launchFdv: 100000,
  threshold: 50,
  cliffDays: 30,
  durationDays: 365,
  documents: [{ type: 'strategy', title: '', url: '' }],
  acknowledge: false,
  submittedAppId: null,
};

function ApplyWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'profile', label: 'Agent Profile', description: 'Basic information about your agent' },
    { id: 'revenue', label: 'Revenue Verification', description: 'Wallet, metrics, and documents' },
    { id: 'ico', label: 'ICO Configuration', description: 'Set launch parameters' },
    { id: 'preview', label: 'Preview & Submit', description: 'Review and submit application' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const raiseTarget = form.launchFdv * 0.1;
  const progressValue = (currentStepIndex + 1) / steps.length;

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTeam = (index: number, field: keyof TeamMember, value: string) => {
    setForm((prev) => {
      const team = [...prev.team];
      team[index] = { ...team[index], [field]: value };
      return { ...prev, team };
    });
  };

  const addTeamMember = () => {
    setForm((prev) => ({
      ...prev,
      team: [...prev.team, { name: '', role: '', profileUrl: '' }],
    }));
  };

  const removeTeamMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const updateDocument = (index: number, field: keyof DocumentMeta, value: string) => {
    setForm((prev) => {
      const documents = [...prev.documents];
      documents[index] = { ...documents[index], [field]: value } as DocumentMeta;
      return { ...prev, documents };
    });
  };

  const addDocument = () => {
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, { type: 'strategy', title: '', url: '' }],
    }));
  };

  const removeDocument = (index: number) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const canProceed = (): boolean => {
    if (currentStep === 'profile') {
      return form.name.trim().length > 0 && form.description.trim().length > 0;
    }
    if (currentStep === 'revenue') {
      const hasDocs = form.documents.some((d) => d.title.trim() && d.url.trim());
      return form.revenueWallet.trim().length > 0 && hasDocs;
    }
    if (currentStep === 'ico') {
      return (
        form.launchFdv >= 50000 &&
        form.launchFdv <= 5000000 &&
        form.threshold >= 50 &&
        form.threshold <= 80 &&
        form.cliffDays >= 0 &&
        form.durationDays > 0
      );
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    if (!form.acknowledge || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const team = form.team.filter((t) => t.name.trim() && t.role.trim());
      const documentsMeta = form.documents
        .filter((d) => d.title.trim() && d.url.trim())
        .map((d) => ({
          type: d.type,
          title: d.title.trim(),
          url: d.url.trim(),
        }));

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          oneLiner: form.description.trim().slice(0, 80),
          category: form.category,
          chain: form.chain,
          launchFdv: form.launchFdv,
          revenueWallet: form.revenueWallet.trim(),
          thresholdBps: form.threshold * 100,
          vestingCliffDays: form.cliffDays,
          vestingDurationDays: form.durationDays,
          team,
          documentsMeta,
          website: form.website || undefined,
          docs: form.docs || undefined,
          twitter: form.twitter || undefined,
          logoUrl: form.logoUrl || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      updateField('submittedAppId', data.application.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (form.submittedAppId) {
    return (
      <div className="arca-page">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="arca-surface p-8"
          >
            <div className="text-center mb-6">
              <MdIcon style={{ fontSize: 48, color: 'var(--md-sys-color-primary, #5D74E5)' }}>
                check_circle
              </MdIcon>
              <h1 className="font-display font-bold text-chalk text-3xl mb-2 mt-2">
                Application Submitted
              </h1>
              <p className="text-chalk-dim">
                Your agent application is in the review queue.
              </p>
            </div>
            <MdList>
              <MdListItem>
                <MdIcon slot="start">flag</MdIcon>
                <div slot="headline">Status</div>
                <div slot="supporting-text">Submitted</div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">tag</MdIcon>
                <div slot="headline">Application ID</div>
                <div slot="supporting-text">{form.submittedAppId}</div>
              </MdListItem>
              <MdDivider />
              <MdListItem>
                <MdIcon slot="start">smart_toy</MdIcon>
                <div slot="headline">Agent</div>
                <div slot="supporting-text">{form.name}</div>
              </MdListItem>
            </MdList>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="arca-page">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="arca-section-title mb-4">Apply To Launch On arca</h1>
          <p className="arca-page-lead">
            Submit your AI agent for review. Admin approval required before ICO launch.
          </p>
        </motion.div>

        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/75">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-white font-semibold">
              {Math.round(progressValue * 100)}%
            </span>
          </div>
          <MdLinearProgress
            className="on-brand-progress"
            value={progressValue}
            max={1}
            style={{ width: '100%' }}
          />
          <MdChipSet>
            {steps.map((step, index) => (
              <MdFilterChip
                key={step.id}
                label={step.label}
                selected={index === currentStepIndex}
                className="on-brand-filter-chip"
                onClick={() => {
                  if (index <= currentStepIndex) {
                    setCurrentStep(step.id);
                  }
                }}
              />
            ))}
          </MdChipSet>
        </div>

        <div className="arca-surface p-8">
          <h2 className="font-display font-bold text-chalk text-2xl mb-2">
            {steps[currentStepIndex].label}
          </h2>
          <p className="text-chalk-dim mb-8">{steps[currentStepIndex].description}</p>

          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div className="arca-surface-muted px-4 py-3">
                <p className="text-chalk-dim text-sm">
                  <span className="text-chalk font-semibold">Tier:</span>{' '}
                  Pending admin assignment
                </p>
              </div>

              <MdOutlinedTextField
                label="Agent Name *"
                value={form.name}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInput={(e: any) => updateField('name', e.target.value)}
                placeholder="e.g., Quantum Flux"
                style={{ width: '100%' }}
              />

              <MdOutlinedTextField
                label="Description *"
                type="textarea"
                rows={4}
                value={form.description}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInput={(e: any) => updateField('description', e.target.value)}
                placeholder="Describe your agent's strategy and approach..."
                style={{ width: '100%' }}
              />

              <MdOutlinedTextField
                label="Logo URL"
                type="url"
                value={form.logoUrl}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInput={(e: any) => updateField('logoUrl', e.target.value)}
                placeholder="https://"
                style={{ width: '100%' }}
              >
                <MdIcon slot="leading-icon">image</MdIcon>
              </MdOutlinedTextField>

              <MdOutlinedSelect
                label="Category *"
                value={form.category}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => updateField('category', e.target.value as Category)}
                style={{ width: '100%' }}
              >
                {CATEGORIES.map((c) => (
                  <MdSelectOption key={c} value={c}><div slot="headline">{c}</div></MdSelectOption>
                ))}
              </MdOutlinedSelect>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MdOutlinedTextField
                  label="Website"
                  type="url"
                  value={form.website}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) => updateField('website', e.target.value)}
                  placeholder="https://"
                  style={{ width: '100%' }}
                >
                  <MdIcon slot="leading-icon">language</MdIcon>
                </MdOutlinedTextField>
                <MdOutlinedTextField
                  label="Docs"
                  type="url"
                  value={form.docs}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) => updateField('docs', e.target.value)}
                  placeholder="https://"
                  style={{ width: '100%' }}
                >
                  <MdIcon slot="leading-icon">description</MdIcon>
                </MdOutlinedTextField>
                <MdOutlinedTextField
                  label="Twitter"
                  type="url"
                  value={form.twitter}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) => updateField('twitter', e.target.value)}
                  placeholder="https://"
                  style={{ width: '100%' }}
                >
                  <MdIcon slot="leading-icon">alternate_email</MdIcon>
                </MdOutlinedTextField>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-chalk text-sm font-semibold">Team</label>
                  <MdTextButton type="button" onClick={addTeamMember}>
                    <MdIcon slot="icon">person_add</MdIcon>
                    Add member
                  </MdTextButton>
                </div>
                <div className="space-y-4">
                  {form.team.map((member, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 arca-surface-muted"
                    >
                      <MdOutlinedTextField
                        label="Name"
                        value={member.name}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onInput={(e: any) => updateTeam(index, 'name', e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <MdOutlinedTextField
                        label="Role"
                        value={member.role}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onInput={(e: any) => updateTeam(index, 'role', e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <div className="flex gap-2 items-end">
                        <MdOutlinedTextField
                          label="Profile URL"
                          type="url"
                          value={member.profileUrl}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onInput={(e: any) => updateTeam(index, 'profileUrl', e.target.value)}
                          style={{ width: '100%', flex: 1 }}
                        />
                        {form.team.length > 1 && (
                          <MdOutlinedButton
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            aria-label="Remove team member"
                          >
                            <MdIcon slot="icon">close</MdIcon>
                          </MdOutlinedButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'revenue' && (
            <div className="space-y-6">
              <MdOutlinedSelect
                label="Primary Chain *"
                value={form.chain}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => updateField('chain', e.target.value as Chain)}
                style={{ width: '100%' }}
              >
                <MdSelectOption value="solana"><div slot="headline">Solana</div></MdSelectOption>
                <MdSelectOption value="robinhood"><div slot="headline">Robinhood Chain</div></MdSelectOption>
              </MdOutlinedSelect>

              <MdOutlinedTextField
                label="Revenue Wallet Address *"
                value={form.revenueWallet}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInput={(e: any) => updateField('revenueWallet', e.target.value)}
                placeholder="Enter wallet address"
                style={{ width: '100%' }}
              >
                <MdIcon slot="leading-icon">account_balance_wallet</MdIcon>
              </MdOutlinedTextField>

              <div className="arca-surface-muted p-4">
                <p className="text-chalk-dim text-sm mb-4">
                  Auto-pull pending wallet connect
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Revenue', 'Volume', 'Win Rate', 'Wallet Age'].map((label) => (
                    <div key={label} className="bg-ink rounded-lg p-3 border border-white/10">
                      <p className="text-chalk-dim text-xs mb-1">{label}</p>
                      <p className="text-chalk-dim font-mono text-sm">n/a</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                <p className="text-chalk text-sm">
                  <strong>Circularity:</strong> Internal flag for admin review
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-chalk text-sm font-semibold">
                    Documents * (at least 1)
                  </label>
                  <MdTextButton type="button" onClick={addDocument}>
                    <MdIcon slot="icon">note_add</MdIcon>
                    Add document
                  </MdTextButton>
                </div>
                <div className="space-y-4">
                  {form.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 arca-surface-muted items-end"
                    >
                      <MdOutlinedSelect
                        label="Type"
                        value={doc.type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e: any) => updateDocument(index, 'type', e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <MdSelectOption value="strategy"><div slot="headline">Strategy</div></MdSelectOption>
                        <MdSelectOption value="audit"><div slot="headline">Audit</div></MdSelectOption>
                        <MdSelectOption value="other"><div slot="headline">Other</div></MdSelectOption>
                      </MdOutlinedSelect>
                      <MdOutlinedTextField
                        label="Title"
                        value={doc.title}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onInput={(e: any) => updateDocument(index, 'title', e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <MdOutlinedTextField
                        label="URL"
                        type="url"
                        value={doc.url}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onInput={(e: any) => updateDocument(index, 'url', e.target.value)}
                        placeholder="https://"
                        style={{ width: '100%' }}
                      />
                      {form.documents.length > 1 && (
                        <MdOutlinedButton
                          type="button"
                          onClick={() => removeDocument(index)}
                        >
                          <MdIcon slot="icon">delete</MdIcon>
                          Remove
                        </MdOutlinedButton>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'ico' && (
            <div className="space-y-6">
              <div>
                <MdOutlinedTextField
                  label="Launch FDV (USD) *"
                  type="number"
                  min="50000"
                  max="5000000"
                  value={String(form.launchFdv)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) =>
                    updateField('launchFdv', Number(e.target.value) || 0)
                  }
                  style={{ width: '100%' }}
                />
                <p className="text-chalk-dim text-sm mt-2">
                  Min $50,000 · Max $5,000,000
                </p>
              </div>

              <div className="arca-surface-muted p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-chalk-dim text-sm">Raise Target (FDV × 10%)</span>
                  <span className="text-mint font-bold text-xl">
                    ${raiseTarget.toLocaleString()}
                  </span>
                </div>
                <MdDivider />
                <div className="flex items-center justify-between">
                  <span className="text-chalk-dim text-sm">Total Supply</span>
                  <span className="text-chalk font-semibold">1,000,000,000</span>
                </div>
              </div>

              <div className="arca-surface-muted p-4">
                <h4 className="text-chalk font-semibold mb-3">Locked Token Allocation</h4>
                <MdList>
                  <MdListItem>
                    <div slot="headline">Open Market / LP</div>
                    <div slot="trailing-supporting-text">50% (500M)</div>
                  </MdListItem>
                  <MdListItem>
                    <div slot="headline">Agent Wallet (Locked)</div>
                    <div slot="trailing-supporting-text">20% (200M)</div>
                  </MdListItem>
                  <MdListItem>
                    <div slot="headline">Deployer (Your Vesting)</div>
                    <div slot="trailing-supporting-text">20% (200M)</div>
                  </MdListItem>
                  <MdListItem>
                    <div slot="headline">Presale Participants</div>
                    <div slot="trailing-supporting-text">10% (100M)</div>
                  </MdListItem>
                </MdList>
              </div>

              <div>
                <label className="block text-chalk text-sm font-semibold mb-2">
                  Raise Threshold (%) *
                </label>
                <MdSlider
                  min={50}
                  max={80}
                  step={1}
                  value={form.threshold}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) => updateField('threshold', Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-chalk-dim">50%</span>
                  <span className="text-mint font-bold">{form.threshold}%</span>
                  <span className="text-chalk-dim">80%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MdOutlinedTextField
                  label="Vesting Cliff (days)"
                  type="number"
                  min="0"
                  value={String(form.cliffDays)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) =>
                    updateField('cliffDays', Number(e.target.value) || 0)
                  }
                  style={{ width: '100%' }}
                />
                <MdOutlinedTextField
                  label="Vesting Duration (days)"
                  type="number"
                  min="1"
                  value={String(form.durationDays)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onInput={(e: any) =>
                    updateField('durationDays', Number(e.target.value) || 0)
                  }
                  style={{ width: '100%' }}
                />
              </div>

              <div className="arca-surface p-4 buyback-glow border-mint/20">
                <h4 className="text-chalk font-semibold mb-3">
                  Buyback Split (Immutable)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-chalk-dim">Agent Token Buyback</span>
                    <span className="text-mint font-bold">90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-chalk-dim">Platform Token Buyback</span>
                    <span className="text-gold font-bold">10%</span>
                  </div>
                </div>
                <p className="text-chalk-dim text-xs mt-3">
                  Buyback 90/10 is immutable and cannot be modified post launch
                </p>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="arca-surface-muted overflow-hidden">
                <h3 className="font-bold text-chalk px-4 pt-4 mb-2">Application Summary</h3>
                <MdList>
                  {[
                    ['Agent Name', form.name || 'Not set', 'badge'],
                    ['Category', form.category, 'category'],
                    ['Chain', form.chain, 'link'],
                    ['Revenue Wallet', form.revenueWallet || 'Not set', 'account_balance_wallet'],
                    ['Launch FDV', `$${form.launchFdv.toLocaleString()}`, 'payments'],
                    ['Raise Target', `$${raiseTarget.toLocaleString()}`, 'trending_up'],
                    ['Threshold', `${form.threshold}%`, 'tune'],
                    ['Vesting', `${form.cliffDays}d cliff / ${form.durationDays}d`, 'schedule'],
                    [
                      'Team',
                      `${form.team.filter((t) => t.name).length} member(s)`,
                      'group',
                    ],
                    [
                      'Documents',
                      `${form.documents.filter((d) => d.title && d.url).length}`,
                      'folder',
                    ],
                  ].map(([label, value, icon], i, arr) => (
                    <div key={label}>
                      <MdListItem>
                        <MdIcon slot="start">{icon}</MdIcon>
                        <div slot="headline">{label}</div>
                        <div slot="supporting-text" className="capitalize">
                          {value}
                        </div>
                      </MdListItem>
                      {i < arr.length - 1 && <MdDivider />}
                    </div>
                  ))}
                </MdList>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <MdCheckbox
                  checked={form.acknowledge}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => updateField('acknowledge', Boolean(e.target.checked))}
                />
                <span className="text-chalk-dim text-sm">
                  I understand that tier assignment, tokenomics, and buyback split are
                  determined by Arca and cannot be modified post launch. I agree to the
                  platform terms.
                </span>
              </label>

              {error && (
                <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-error text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          <MdDivider style={{ marginTop: 32, marginBottom: 24 }} />

          <div className="flex items-center justify-between">
            <MdOutlinedButton
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              <MdIcon slot="icon">arrow_back</MdIcon>
              Previous
            </MdOutlinedButton>

            {currentStepIndex < steps.length - 1 ? (
              <MdFilledButton onClick={handleNext} disabled={!canProceed()}>
                Continue
                <MdIcon slot="icon">arrow_forward</MdIcon>
              </MdFilledButton>
            ) : (
              <MdFilledButton
                onClick={handleSubmit}
                disabled={!form.acknowledge || submitting}
              >
                {submitting ? (
                  <MdCircularProgress
                    indeterminate
                    slot="icon"
                    style={{ width: 20, height: 20 }}
                  />
                ) : (
                  <MdIcon slot="icon">send</MdIcon>
                )}
                {submitting ? 'Submitting...' : 'Submit Application'}
              </MdFilledButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <RequireAuth title="Sign In To Apply As A Deployer">
      <ApplyWizard />
    </RequireAuth>
  );
}
