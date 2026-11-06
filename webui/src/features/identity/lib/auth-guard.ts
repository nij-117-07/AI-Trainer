// src/features/identity/lib/auth-guard.ts
/**
 * Mode-aware identity validator with dev fallbacks.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserIdentity } from '../types';
import { getTokenFromCookie } from '@/features/auth/lib/jwt';
import { getAuthMode } from '@/features/auth/lib/mode';

/**
 * Checks if we are in strict production mode.
 * Respects NEXT_PUBLIC_APP_MODE if set, otherwise NODE_ENV.
 */
function isProduction(): boolean {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE || process.env.NODE_ENV;
  return appMode === 'production';
}

/**
 * Validates identity based on user-selected mode.
 */
export async function validateIdentity(): Promise<UserIdentity> {
  const mode = await getAuthMode();
  const strict = isProduction();

  // If user explicitly selected Standard mode
  if (mode === 'standard') {
    return validateJWT(strict);
  }

  // If user explicitly selected SSO/Authentic mode
  if (mode === 'authentic') {
    return validateProxyHeaders(strict);
  }

  // Auto-detect: Try proxy first, fallback to JWT
  try {
    return await validateProxyHeaders(false);
  } catch {
    return validateJWT(strict);
  }
}

/** Validates proxy headers. Returns dev fallback if not in production. */
async function validateProxyHeaders(shouldRedirect: boolean): Promise<UserIdentity> {
  const headersList = await headers();
  const userHeader = process.env.NEXT_PUBLIC_AUTH_USER_HEADER || 'x-authentik-username';
  const emailHeader = process.env.NEXT_PUBLIC_AUTH_EMAIL_HEADER || 'x-authentik-email';
  const groupsHeader = process.env.NEXT_PUBLIC_AUTH_GROUPS_HEADER || 'x-authentik-groups';
  
  const rawUser = headersList.get(userHeader);
  const rawEmail = headersList.get(emailHeader);
  const rawGroups = headersList.get(groupsHeader);

  // If headers exist, use them (Real SSO)
  if (rawUser) {
    return {
      username: rawUser,
      email: rawEmail || 'n/a',
      groups: rawGroups ? rawGroups.split(',').map(g => g.trim()) : [],
      logoutUrl: process.env.NEXT_PUBLIC_LOGOUT_URL || '#',
    };
  }

  // Production: Must have headers
  if (shouldRedirect) {
    redirect('/unauthorized');
  }

  // Development: Return fallback SSO user instead of crashing
  console.log('[AUTH_DEBUG] No SSO headers found, returning dev fallback user');
  return {
    username: 'sso_dev_user',
    email: 'sso-dev@localhost',
    groups: ['admin', 'sso-tester'],
    logoutUrl: '/select-mode', // Redirects back to selector on logout
  };
}

/** Validates JWT cookie. Returns dev fallback if not in production. */
async function validateJWT(isStrict: boolean): Promise<UserIdentity> {
  const jwtPayload = await getTokenFromCookie();
  
  if (jwtPayload) {
    return {
      username: jwtPayload.username,
      email: jwtPayload.email,
      groups: jwtPayload.roles,
      logoutUrl: '/login?action=logout',
    };
  }

  if (isStrict) {
    redirect('/login');
  }

  // Development fallback
  return {
    username: 'dev_user',
    email: 'dev@localhost',
    groups: ['admin', 'developers'],
    logoutUrl: '#',
  };
}