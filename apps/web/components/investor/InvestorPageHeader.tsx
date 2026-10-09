'use client';

export function InvestorPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="inv-page-header">
      <div className="inv-page-header-copy">
        <h1 className="inv-page-title">{title}</h1>
        <p className="inv-page-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
