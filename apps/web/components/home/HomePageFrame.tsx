'use client';

import { usePathname } from 'next/navigation';

function isFramedPath(pathname: string) {
  if (pathname === '/') return true;
  // Agent detail (not nested /ico or other subroutes)
  return /^\/agents\/[^/]+$/.test(pathname);
}

export function HomePageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isFramedPath(pathname)) {
    return <>{children}</>;
  }

  return <div className="home-frame-shell">{children}</div>;
}
