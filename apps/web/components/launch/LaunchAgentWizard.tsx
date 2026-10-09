'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WalletStatsPanel } from '@/components/WalletStatsPanel';
import { FileDropzone } from './FileDropzone';
import {
  DOC_ACCEPT,
  DOC_EXTS,
  DOC_MIMES,
  LAUNCH_CATEGORIES,
  LAUNCH_STEPS,
  LOGO_ACCEPT,
  LOGO_EXTS,
  LOGO_MIMES,
  initialLaunchForm,
  type Category,
  type Chain,
  type DocumentMeta,
  type LaunchFormState,
  type LaunchStep,
  type TeamMember,
} from './types';

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="launch-field">
      <label className="launch-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="launch-hint">{hint}</p> : null}
    </div>
  );
}

export function LaunchAgentWizard() {
  const { wallet } = useAuth();
  const [currentStep, setCurrentStep] = useState<LaunchStep>('profile');
  const [form, setForm] = useState<LaunchFormState>(initialLaunchForm);
  const [logoFileName, setLogoFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocOpen, setAllocOpen] = useState(false);

  const currentStepIndex = LAUNCH_STEPS.findIndex((s) => s.id === currentStep);
  const raiseTarget = form.launchFdv * 0.1;
  const progressPct = Math.round(((currentStepIndex + 1) / LAUNCH_STEPS.length) * 100);

  const updateField = <K extends keyof LaunchFormState>(
    field: K,
    value: LaunchFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTeam = (index: number, field: keyof TeamMember, value: string) => {
    setForm((prev) => {
      const team = [...prev.team];
      team[index] = { ...team[index], [field]: value };
      return { ...prev, team };
    });
  };

  const updateDocument = (
    index: number,
    field: keyof DocumentMeta,
    value: string,
  ) => {
    setForm((prev) => {
      const documents = [...prev.documents];
      documents[index] = { ...documents[index], [field]: value } as DocumentMeta;
      return { ...prev, documents };
    });
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
    if (nextIndex < LAUNCH_STEPS.length) {
      setCurrentStep(LAUNCH_STEPS[nextIndex].id);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(LAUNCH_STEPS[prevIndex].id);
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
          ownerWallet: wallet || undefined,
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
      <motion.div
        className="launch-success"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="launch-success-icon" aria-hidden>
          <Image
            src="/deploy-agent/icon-check.svg"
            alt=""
            width={28}
            height={28}
          />
        </div>
        <h2 className="launch-panel-title">Application submitted</h2>
        <p className="launch-panel-sub">
          Your agent is in the review queue. Admin approval is required before ICO
          launch.
        </p>
        <div className="launch-summary">
          <div className="launch-summary-row">
            <span>Status</span>
            <strong>Submitted</strong>
          </div>
          <div className="launch-summary-row">
            <span>Application ID</span>
            <strong className="launch-mono">{form.submittedAppId}</strong>
          </div>
          <div className="launch-summary-row">
            <span>Agent</span>
            <strong>{form.name}</strong>
          </div>
        </div>
        <div className="launch-nav">
          <Link href="/deployer" className="inv-btn inv-btn--primary">
            Back to dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="launch-wizard">
      <div className="launch-progress-head">
        <div className="launch-progress-meta">
          <span>
            Step {currentStepIndex + 1} of {LAUNCH_STEPS.length}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="launch-progress-track" aria-hidden>
          <div
            className="launch-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="launch-steps" aria-label="Launch steps">
          {LAUNCH_STEPS.map((step, index) => {
            const state =
              index === currentStepIndex
                ? 'is-current'
                : index < currentStepIndex
                  ? 'is-done'
                  : '';
            return (
              <li
                key={step.id}
                className={`launch-step ${state}`}
                aria-current={index === currentStepIndex ? 'step' : undefined}
              >
                <span className="launch-step-index">
                  {index < currentStepIndex ? (
                    <Image
                      src="/deploy-agent/icon-check.svg"
                      alt=""
                      width={12}
                      height={12}
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="launch-step-label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <motion.div
        key={currentStep}
        className="launch-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="launch-panel-head">
          <h2 className="launch-panel-title">
            {LAUNCH_STEPS[currentStepIndex].label}
          </h2>
          <p className="launch-panel-sub">
            {LAUNCH_STEPS[currentStepIndex].description}
          </p>
        </div>

        {currentStep === 'profile' && (
          <div className="launch-stack">
            <div className="launch-note">
              <span className="launch-note-kicker">Tier</span>
              Pending admin assignment after review
            </div>

            <Field label="Agent name *" htmlFor="launch-name">
              <input
                id="launch-name"
                className="launch-input"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Quantum Flux"
              />
            </Field>

            <Field label="Description *" htmlFor="launch-description">
              <textarea
                id="launch-description"
                className="launch-input launch-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your agent's strategy and approach"
              />
            </Field>

            <Field label="Agent logo" htmlFor="launch-logo-input">
              <FileDropzone
                inputId="launch-logo-input"
                labelledBy="launch-logo-label"
                emptyTitle="Drop an image here or click to upload"
                hint="PNG, JPG, WEBP, SVG, or GIF · max 4 MB"
                accept={LOGO_ACCEPT}
                exts={LOGO_EXTS}
                mimes={LOGO_MIMES}
                value={form.logoUrl}
                fileName={logoFileName}
                onFile={(dataUrl, name) => {
                  updateField('logoUrl', dataUrl);
                  setLogoFileName(name);
                }}
                onClear={() => {
                  updateField('logoUrl', '');
                  setLogoFileName('');
                }}
              />
              <span id="launch-logo-label" className="sr-only">
                Agent logo
              </span>
            </Field>

            <Field label="Category *" htmlFor="launch-category">
              <select
                id="launch-category"
                className="launch-input launch-select"
                value={form.category}
                onChange={(e) =>
                  updateField('category', e.target.value as Category)
                }
              >
                {LAUNCH_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <div className="launch-grid-3">
              <Field label="Website" htmlFor="launch-website">
                <input
                  id="launch-website"
                  className="launch-input"
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Docs" htmlFor="launch-docs">
                <input
                  id="launch-docs"
                  className="launch-input"
                  type="url"
                  value={form.docs}
                  onChange={(e) => updateField('docs', e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field label="Twitter" htmlFor="launch-twitter">
                <input
                  id="launch-twitter"
                  className="launch-input"
                  type="url"
                  value={form.twitter}
                  onChange={(e) => updateField('twitter', e.target.value)}
                  placeholder="https://"
                />
              </Field>
            </div>

            <div className="launch-team">
              <div className="launch-row-head">
                <h3 className="launch-section-title">Team</h3>
                <button
                  type="button"
                  className="launch-text-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      team: [
                        ...prev.team,
                        { name: '', role: '', profileUrl: '' },
                      ],
                    }))
                  }
                >
                  Add member
                </button>
              </div>
              <div className="launch-stack">
                {form.team.map((member, index) => (
                  <div key={index} className="launch-card launch-grid-3">
                    <Field label="Name">
                      <input
                        className="launch-input"
                        value={member.name}
                        onChange={(e) =>
                          updateTeam(index, 'name', e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Role">
                      <input
                        className="launch-input"
                        value={member.role}
                        onChange={(e) =>
                          updateTeam(index, 'role', e.target.value)
                        }
                      />
                    </Field>
                    <div className="launch-inline-end">
                      <Field label="Profile URL">
                        <input
                          className="launch-input"
                          type="url"
                          value={member.profileUrl}
                          onChange={(e) =>
                            updateTeam(index, 'profileUrl', e.target.value)
                          }
                        />
                      </Field>
                      {form.team.length > 1 ? (
                        <button
                          type="button"
                          className="inv-btn inv-btn--ghost launch-remove"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              team: prev.team.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'revenue' && (
          <div className="launch-stack">
            <Field label="Primary chain *" htmlFor="launch-chain">
              <select
                id="launch-chain"
                className="launch-input launch-select"
                value={form.chain}
                onChange={(e) => updateField('chain', e.target.value as Chain)}
              >
                <option value="solana">Solana</option>
                <option value="robinhood">Robinhood Chain</option>
              </select>
            </Field>

            <Field
              label="Revenue wallet address *"
              htmlFor="launch-wallet"
              hint="Used to verify historical revenue and circularity signals"
            >
              <input
                id="launch-wallet"
                className="launch-input launch-mono"
                value={form.revenueWallet}
                onChange={(e) => updateField('revenueWallet', e.target.value)}
                placeholder="Enter wallet address"
              />
            </Field>

            <WalletStatsPanel address={form.revenueWallet} chain={form.chain} />

            <div className="launch-note launch-note--warn">
              Circularity is an internal flag for admin review and does not block
              submission.
            </div>

            <div className="launch-docs">
              <div className="launch-row-head">
                <h3 className="launch-section-title">Documents *</h3>
                <button
                  type="button"
                  className="launch-text-btn"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      documents: [
                        ...prev.documents,
                        { type: 'strategy', title: '', url: '', fileName: '' },
                      ],
                    }))
                  }
                >
                  Add document
                </button>
              </div>
              <div className="launch-stack">
                {form.documents.map((doc, index) => {
                  const fileInputId = `launch-doc-file-${index}`;
                  return (
                    <div key={index} className="launch-card launch-doc-grid">
                      <Field label="Type">
                        <select
                          className="launch-input launch-select"
                          value={doc.type}
                          onChange={(e) =>
                            updateDocument(index, 'type', e.target.value)
                          }
                        >
                          <option value="strategy">Strategy</option>
                          <option value="audit">Audit</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                      <Field label="Title">
                        <input
                          className="launch-input"
                          value={doc.title}
                          onChange={(e) =>
                            updateDocument(index, 'title', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Document file">
                        <FileDropzone
                          inputId={fileInputId}
                          labelledBy={`${fileInputId}-label`}
                          emptyTitle="Drop a file or click to upload"
                          hint="PDF, images, or text · max 4 MB"
                          accept={DOC_ACCEPT}
                          exts={DOC_EXTS}
                          mimes={DOC_MIMES}
                          compact
                          value={doc.url}
                          fileName={doc.fileName}
                          onFile={(dataUrl, name) => {
                            setForm((prev) => {
                              const documents = [...prev.documents];
                              documents[index] = {
                                ...documents[index],
                                url: dataUrl,
                                fileName: name,
                              };
                              return { ...prev, documents };
                            });
                          }}
                          onClear={() => {
                            setForm((prev) => {
                              const documents = [...prev.documents];
                              documents[index] = {
                                ...documents[index],
                                url: '',
                                fileName: '',
                              };
                              return { ...prev, documents };
                            });
                          }}
                        />
                        <span id={`${fileInputId}-label`} className="sr-only">
                          Document file
                        </span>
                      </Field>
                      {form.documents.length > 1 ? (
                        <button
                          type="button"
                          className="inv-btn inv-btn--ghost"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              documents: prev.documents.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'ico' && (
          <div className="launch-stack">
            <Field
              label="Launch FDV (USD) *"
              htmlFor="launch-fdv"
              hint="Min $50,000 · Max $5,000,000"
            >
              <input
                id="launch-fdv"
                className="launch-input"
                type="number"
                min={50000}
                max={5000000}
                value={form.launchFdv}
                onChange={(e) =>
                  updateField('launchFdv', Number(e.target.value) || 0)
                }
              />
            </Field>

            <div className="launch-card launch-metrics">
              <div className="launch-metric">
                <span>Raise target (FDV × 10%)</span>
                <strong>${raiseTarget.toLocaleString()}</strong>
              </div>
              <div className="launch-metric">
                <span>Total supply</span>
                <strong>1,000,000,000</strong>
              </div>
            </div>

            <div className="launch-card">
              <button
                type="button"
                className="launch-disclosure"
                aria-expanded={allocOpen}
                onClick={() => setAllocOpen((v) => !v)}
              >
                <span>Locked token allocation</span>
                <Image
                  src="/deploy-agent/icon-chevron.svg"
                  alt=""
                  width={14}
                  height={14}
                  className={allocOpen ? 'is-open' : ''}
                />
              </button>
              {allocOpen ? (
                <ul className="launch-alloc-list">
                  <li>
                    <span>Open Market / LP</span>
                    <strong>50% (500M)</strong>
                  </li>
                  <li>
                    <span>Agent Wallet (Locked)</span>
                    <strong>20% (200M)</strong>
                  </li>
                  <li>
                    <span>Deployer (Your Vesting)</span>
                    <strong>20% (200M)</strong>
                  </li>
                  <li>
                    <span>Presale Participants</span>
                    <strong>10% (100M)</strong>
                  </li>
                </ul>
              ) : null}
            </div>

            <Field label={`Raise threshold · ${form.threshold}%`}>
              <input
                className="launch-range"
                type="range"
                min={50}
                max={80}
                step={1}
                value={form.threshold}
                onChange={(e) =>
                  updateField('threshold', Number(e.target.value))
                }
              />
              <div className="launch-range-labels">
                <span>50%</span>
                <span>80%</span>
              </div>
            </Field>

            <div className="launch-grid-2">
              <Field label="Vesting cliff (days)" htmlFor="launch-cliff">
                <input
                  id="launch-cliff"
                  className="launch-input"
                  type="number"
                  min={0}
                  value={form.cliffDays}
                  onChange={(e) =>
                    updateField('cliffDays', Number(e.target.value) || 0)
                  }
                />
              </Field>
              <Field label="Vesting duration (days)" htmlFor="launch-duration">
                <input
                  id="launch-duration"
                  className="launch-input"
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) =>
                    updateField('durationDays', Number(e.target.value) || 0)
                  }
                />
              </Field>
            </div>

            <div className="launch-card launch-buyback">
              <h3 className="launch-section-title">Buyback split (immutable)</h3>
              <div className="launch-metric">
                <span>Agent token buyback</span>
                <strong>90%</strong>
              </div>
              <div className="launch-metric">
                <span>Platform token buyback</span>
                <strong>10%</strong>
              </div>
              <p className="launch-hint">
                This split is locked at launch and cannot be modified afterward.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="launch-stack">
            <div className="launch-summary">
              {form.logoUrl ? (
                <div className="launch-summary-logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoUrl} alt="" />
                  <div>
                    <p className="launch-section-title">Agent logo</p>
                    <p className="launch-hint">{logoFileName || 'Attached'}</p>
                  </div>
                </div>
              ) : null}
              {[
                ['Agent name', form.name || 'Not set'],
                ['Category', form.category],
                ['Chain', form.chain],
                ['Revenue wallet', form.revenueWallet || 'Not set'],
                ['Launch FDV', `$${form.launchFdv.toLocaleString()}`],
                ['Raise target', `$${raiseTarget.toLocaleString()}`],
                ['Threshold', `${form.threshold}%`],
                [
                  'Vesting',
                  `${form.cliffDays}d cliff / ${form.durationDays}d`,
                ],
                [
                  'Team',
                  `${form.team.filter((t) => t.name).length} member(s)`,
                ],
                [
                  'Documents',
                  `${form.documents.filter((d) => d.title && d.url).length}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="launch-summary-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <label className="launch-check">
              <input
                type="checkbox"
                checked={form.acknowledge}
                onChange={(e) => updateField('acknowledge', e.target.checked)}
              />
              <span>
                I understand that tier assignment, tokenomics, and buyback split
                are determined by Arca and cannot be modified post launch. I
                agree to the platform terms.
              </span>
            </label>

            {error ? (
              <p className="launch-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}

        <div className="launch-nav">
          <button
            type="button"
            className="inv-btn inv-btn--ghost"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            Back
          </button>
          {currentStepIndex < LAUNCH_STEPS.length - 1 ? (
            <button
              type="button"
              className="inv-btn inv-btn--primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <Image
                src="/deployer/icon-arrow-up-right.svg"
                alt=""
                width={18}
                height={18}
              />
            </button>
          ) : (
            <button
              type="button"
              className="inv-btn inv-btn--primary"
              onClick={handleSubmit}
              disabled={!form.acknowledge || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
