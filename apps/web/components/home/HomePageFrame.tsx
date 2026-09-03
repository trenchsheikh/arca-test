'use client';

import { usePathname } from 'next/navigation';

export function HomePageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (!isHomePage) {
    return <>{children}</>;
  }

  return <div className="home-frame-shell">{children}</div>;
}
