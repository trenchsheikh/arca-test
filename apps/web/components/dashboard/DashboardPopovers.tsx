'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';

function Corners() {
  return (
    <>
      <span className="inv-corner inv-corner--tl" aria-hidden />
      <span className="inv-corner inv-corner--tr" aria-hidden />
      <span className="inv-corner inv-corner--bl" aria-hidden />
      <span className="inv-corner inv-corner--br" aria-hidden />
    </>
  );
}

type Panel = 'inbox' | 'notifications';

export function DashboardPopovers({
  mailIcon,
  bellIcon,
}: {
  mailIcon: string;
  bellIcon: string;
}) {
  const [open, setOpen] = useState<Panel | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inboxBtnRef = useRef<HTMLButtonElement>(null);
  const notifyBtnRef = useRef<HTMLButtonElement>(null);
  const inboxId = useId();
  const notifyId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const which = open;
      setOpen(null);
      requestAnimationFrame(() => {
        if (which === 'inbox') inboxBtnRef.current?.focus();
        if (which === 'notifications') notifyBtnRef.current?.focus();
      });
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
    panelRef.current?.focus();
  }, [open]);

  const toggle = (panel: Panel) => {
    setOpen((current) => (current === panel ? null : panel));
  };

  return (
    <div ref={rootRef} className="inv-popovers">
      <div className="inv-popover">
        <button
          ref={inboxBtnRef}
          type="button"
          className={`inv-icon-btn${open === 'inbox' ? ' is-open' : ''}`}
          aria-label="Inbox"
          aria-haspopup="dialog"
          aria-expanded={open === 'inbox'}
          aria-controls={inboxId}
          onClick={() => toggle('inbox')}
        >
          <Image src={mailIcon} alt="" width={20} height={20} />
          <Corners />
        </button>
        {open === 'inbox' ? (
          <div
            ref={panelRef}
            id={inboxId}
            className="inv-popover-panel"
            role="dialog"
            aria-label="Inbox"
            tabIndex={-1}
          >
            <Corners />
            <div className="inv-popover-head">Inbox</div>
            <p className="inv-popover-empty">No messages</p>
          </div>
        ) : null}
      </div>

      <div className="inv-popover">
        <button
          ref={notifyBtnRef}
          type="button"
          className={`inv-icon-btn${open === 'notifications' ? ' is-open' : ''}`}
          aria-label="Notifications"
          aria-haspopup="dialog"
          aria-expanded={open === 'notifications'}
          aria-controls={notifyId}
          onClick={() => toggle('notifications')}
        >
          <Image src={bellIcon} alt="" width={20} height={20} />
          <Corners />
        </button>
        {open === 'notifications' ? (
          <div
            ref={panelRef}
            id={notifyId}
            className="inv-popover-panel"
            role="dialog"
            aria-label="Notifications"
            tabIndex={-1}
          >
            <Corners />
            <div className="inv-popover-head">Notifications</div>
            <p className="inv-popover-empty">No notifications</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
