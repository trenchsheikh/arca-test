'use client';

import Image from 'next/image';

export function DeployerTopBar({ crumb }: { crumb: string }) {
  return (
    <div className="inv-topbar">
      <nav className="inv-breadcrumbs" aria-label="Breadcrumb">
        <span className="inv-crumb">Deployer</span>
        <Image
          src="/deployer/icon-breadcrumb-arrow.svg"
          alt=""
          width={10}
          height={20}
          className="inv-crumb-arrow"
        />
        <span className="inv-crumb">{crumb}</span>
      </nav>

      <div className="inv-topbar-actions">
        <label className="inv-search inv-search--top">
          <Image src="/deployer/icon-search.svg" alt="" width={18} height={18} />
          <input type="search" placeholder="Search" aria-label="Search" />
          <span className="inv-corner inv-corner--tl" aria-hidden />
          <span className="inv-corner inv-corner--tr" aria-hidden />
          <span className="inv-corner inv-corner--bl" aria-hidden />
          <span className="inv-corner inv-corner--br" aria-hidden />
        </label>

        <button type="button" className="inv-icon-btn" aria-label="Messages">
          <Image src="/deployer/icon-mail.svg" alt="" width={20} height={20} />
          <span className="inv-corner inv-corner--tl" aria-hidden />
          <span className="inv-corner inv-corner--tr" aria-hidden />
          <span className="inv-corner inv-corner--bl" aria-hidden />
          <span className="inv-corner inv-corner--br" aria-hidden />
        </button>

        <button type="button" className="inv-icon-btn" aria-label="Notifications">
          <Image src="/deployer/icon-bell.svg" alt="" width={20} height={20} />
          <span className="inv-corner inv-corner--tl" aria-hidden />
          <span className="inv-corner inv-corner--tr" aria-hidden />
          <span className="inv-corner inv-corner--bl" aria-hidden />
          <span className="inv-corner inv-corner--br" aria-hidden />
        </button>

        <button type="button" className="inv-icon-btn inv-icon-btn--avatar" aria-label="Account">
          <span className="inv-topbar-avatar" aria-hidden />
          <span className="inv-corner inv-corner--tl" aria-hidden />
          <span className="inv-corner inv-corner--tr" aria-hidden />
          <span className="inv-corner inv-corner--bl" aria-hidden />
          <span className="inv-corner inv-corner--br" aria-hidden />
        </button>
      </div>
    </div>
  );
}
