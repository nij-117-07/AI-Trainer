// src/features/identity/actions/get-identity.ts
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserIdentity } from '../types';

/**
 * Fetches user identity from Authentik headers.
 * Dev Mode: Returns dummy data if headers are missing.
 * Prod Mode: Redirects if headers are missing.
 */
export async function getIdentity(): Promise<UserIdentity> {
  const headersList = await headers();
  const isProd = process.env.NODE_ENV === 'production';

  const userHeader = process.env.NEXT_PUBLIC_AUTH_USER_HEADER || 'x-authentik-username';
  const emailHeader = process.env.NEXT_PUBLIC_AUTH_EMAIL_HEADER || 'x-authentik-email';
  const groupsHeader = process.env.NEXT_PUBLIC_AUTH_GROUPS_HEADER || 'x-authentik-groups';

  const rawUser = headersList.get(userHeader);
  const rawEmail = headersList.get(emailHeader);
  const rawGroups = headersList.get(groupsHeader);

  // Production Safety Check: Redirect if unauthorized
  if (isProd && !rawUser) {
    // In a proxy environment, this usually shouldn't happen, 
    // but we enforce it for security.
    redirect('/unauthorized'); 
  }

  // Development Fallback Logic
  if (!isProd && !rawUser) {
    return {
      username: 'admin45',
      email: 'dummy@gmail.com',
      groups: ['admin', 'developers'],
      logoutUrl: '#',
    };
  }

  return {
    username: rawUser ?? 'Unknown',
    email: rawEmail ?? 'n/a',
    groups: rawGroups ? rawGroups.split(',').map(g => g.trim()) : [],
    logoutUrl: process.env.NEXT_PUBLIC_LOGOUT_URL || '#',
  };
}