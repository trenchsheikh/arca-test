'use client';

export function AdminPageHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <div className="inv-page-header">
      <div className="inv-page-header-copy">
        <h1 className="inv-page-title">{title}</h1>
      </div>
      {badge ? (
        <div className="inv-page-actions">
          <span className="adm-pending-badge">{badge}</span>
        </div>
      ) : null}
    </div>
  );
}
