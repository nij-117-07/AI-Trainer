// src/features/auth/lib/mode.ts
/**
 * Auth mode preference management using HTTP cookies.
 * Mode persists for 1 year or until explicitly changed.
 */

import { cookies } from 'next/headers';

export type AuthMode = 'authentic' | 'standard';

const COOKIE_NAME = 'auth_mode';

/**
 * Retrieves the user's selected authentication mode.
 * Returns null if no preference has been set.
 */
export async function getAuthMode(): Promise<AuthMode | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (value === 'authentic' || value === 'standard') {
    return value;
  }
  return null;
}

/**
 * Sets the authentication mode preference.
 */
export async function setAuthMode(mode: AuthMode): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, mode, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Clears the mode preference (e.g., on logout).
 */
export async function clearAuthMode(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}