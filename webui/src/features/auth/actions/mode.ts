// src/features/auth/actions/mode.ts
'use server';

import { setAuthMode, clearAuthMode, AuthMode } from '../lib/mode';
import { redirect } from 'next/navigation';

/**
 * Sets the authentication mode and redirects appropriately.
 * Authentic -> Dashboard (expects proxy headers)
 * Standard -> Login page (JWT form)
 */
export async function selectAuthMode(mode: AuthMode): Promise<void> {
  await setAuthMode(mode);
  if (mode === 'standard') {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}

/**
 * Clears mode preference and logs out.
 */
export async function resetAuthMode(): Promise<void> {
  await clearAuthMode();
  redirect('/select-mode');
}