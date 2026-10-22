// src/features/auth/actions/logout.ts
'use server';

import { clearTokenCookie } from '../lib/jwt';
import { clearAuthMode } from '../lib/mode';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Clears JWT cookie and auth mode, 
 * revalidates cache, then redirects.
 */
export async function logoutUser(): Promise<never> {
  await clearTokenCookie();
  await clearAuthMode();
  
  // Critical: Clear Next.js cache so protected pages re-check auth
  revalidatePath('/', 'layout');
  
  redirect('/select-mode');
}