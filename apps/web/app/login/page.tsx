import { Suspense } from 'react';
import LoginPage from './LoginClient';

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center text-chalk-dim">
          Loading…
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
