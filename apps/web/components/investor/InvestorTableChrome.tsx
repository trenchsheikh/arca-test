'use client';

import Image from 'next/image';
import { useState } from 'react';

export function InvestorTableChrome({
  title,
  badge,
  searchPlaceholder = 'Search',
  children,
}: {
  title: string;
  badge?: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState('');

  return (
    <section className="inv-table-panel">
      <div className="inv-table-toolbar">
        <div className="inv-table-heading">
          <h2 className="inv-table-title">{title}</h2>
          {badge ? <span className="inv-table-badge">{badge}</span> : null}
        </div>
        <div className="inv-table-controls">
          <label className="inv-search inv-search--table">
            <Image src="/investor/icon-search.svg" alt="" width={18} height={18} />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${title}`}
              data-query={query}
            />
          </label>
          <button type="button" className="inv-filter-btn">
            <Image src="/investor/icon-filter.svg" alt="" width={18} height={18} />
            Filter
          </button>
          <button type="button" className="inv-more-btn" aria-label="More options">
            <Image src="/investor/icon-dots.svg" alt="" width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="inv-table-wrap">{children}</div>
    </section>
  );
}

export function SortHeader({ label }: { label: string }) {
  return (
    <span className="inv-th-sort">
      {label}
      <Image src="/investor/icon-sort.svg" alt="" width={18} height={18} />
    </span>
  );
}
