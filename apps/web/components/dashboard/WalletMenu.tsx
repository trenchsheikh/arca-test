'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';

export function WalletMenu({
  address,
  role,
  chevronIcon,
  collapsed = false,
  onLogout,
}: {
  address: string;
  role: string;
  chevronIcon: string;
  collapsed?: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      requestAnimationFrame(() => buttonRef.current?.focus());
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    logoutRef.current?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="inv-wallet-menu">
      <button
        ref={buttonRef}
        type="button"
        className={`inv-wallet-card${open ? ' is-open' : ''}`}
        aria-label={`${role} account`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {!collapsed ? (
          <span className="inv-wallet-meta">
            <span className="inv-wallet-addr">{address || 'Wallet'}</span>
            <span className="inv-wallet-role">{role}</span>
          </span>
        ) : null}
        {!collapsed ? (
          <Image
            src={chevronIcon}
            alt=""
            width={12}
            height={12}
            className="inv-wallet-chevron"
          />
        ) : null}
      </button>
      {open ? (
        <div id={panelId} className="inv-wallet-popup" role="dialog" aria-label="Account">
          <button
            ref={logoutRef}
            type="button"
            className="inv-wallet-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
