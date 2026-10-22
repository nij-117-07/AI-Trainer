// src/app/select-mode/page.tsx
/**
 * Authentication mode selection page.
 * Entry point for unauthenticated users to choose SSO or Standard login.
 */

import { ModeSelector } from '@/features/auth/components/mode-selector';

export default function SelectModePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">
          Please select your authentication method to continue
        </p>
      </div>
      <ModeSelector />
    </div>
  );
}