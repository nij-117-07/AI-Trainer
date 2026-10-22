// src/features/auth/actions/admin.ts
/**
 * Server Actions for admin user management.
 * All actions validate admin identity before performing mutations.
 */

'use server';

import bcrypt from 'bcrypt';
import { getUsers, addUser, updateUser, findUserByUsername } from '../lib/json-db';
import { validateIdentity } from '@/features/identity/lib/auth-guard';
import type { UserRecord } from '@/features/identity/types';

async function requireAdmin() {
  const identity = await validateIdentity();
  if (!identity.groups.includes('admin')) {
    throw new Error('Unauthorized: admin access required');
  }
  return identity;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return getUsers();
}

export async function createUserByAdmin(formData: FormData) {
  try {
    await requireAdmin();

    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rolesRaw = formData.get('roles') as string;
    const activeRaw = formData.get('active') as string;

    if (!username || !email || !password) {
      return { success: false, error: 'Username, email, and password are required' };
    }

    const existing = await findUserByUsername(username);
    if (existing) {
      return { success: false, error: 'Username already exists' };
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, rounds);
    const roles = rolesRaw ? rolesRaw.split(',').map(r => r.trim()).filter(Boolean) : ['user'];
    const active = activeRaw === 'true';

    await addUser({
      username,
      email,
      passwordHash,
      roles,
      active,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] createUserByAdmin error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create user' };
  }
}

export async function updateUserPassword(username: string, newPassword: string) {
  try {
    await requireAdmin();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(newPassword, rounds);
    await updateUser(username, { passwordHash });

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] updateUserPassword error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update password' };
  }
}

export async function updateUserRoles(username: string, roles: string[]) {
  try {
    await requireAdmin();
    await updateUser(username, { roles });
    return { success: true };
  } catch (error) {
    console.error('[ADMIN] updateUserRoles error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update roles' };
  }
}

export async function toggleUserActive(username: string) {
  try {
    await requireAdmin();
    const user = await findUserByUsername(username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    const updated = await updateUser(username, { active: !user.active });
    return { success: true, active: updated.active };
  } catch (error) {
    console.error('[ADMIN] toggleUserActive error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle active status' };
  }
}
