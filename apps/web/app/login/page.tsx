import { Suspense } from 'react';
import LoginPage from './LoginClient';

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white/80">
          Loading…
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
