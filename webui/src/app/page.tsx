// src/app/page.tsx
/**
 * Root page - redirects to select-mode or dashboard based on auth status.
 */

import { redirect } from 'next/navigation';
import { validateIdentity } from '@/features/identity/lib/auth-guard';

export default async function HomePage() {
  try {
    await validateIdentity();
    redirect('/dashboard');
  } catch {
    redirect('/select-mode');
  }
}