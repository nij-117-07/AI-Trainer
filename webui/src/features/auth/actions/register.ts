// src/features/auth/actions/register.ts
/**
 * Server Action for user self-registration.
 * Creates users with role "user" and active=false (pending admin activation).
 */

'use server';

import bcrypt from 'bcrypt';
import { addUser, findUserByUsername } from '../lib/json-db';
import { verifyCaptcha } from '../lib/captcha';

export async function checkUsernameAvailable(username: string): Promise<{ available: boolean }> {
  if (!username || username.length < 2) return { available: false };
  const existing = await findUserByUsername(username);
  return { available: !existing };
}

export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const captcha = formData.get('captcha') as string;

  if (!username || !email || !password) {
    return { success: false, error: 'All fields are required' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  if (!(await verifyCaptcha(captcha))) {
    return { success: false, error: 'Invalid CAPTCHA. Please try again.' };
  }

  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return { success: false, error: 'Username is already taken' };
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(password, rounds);

    await addUser({
      username,
      email,
      passwordHash,
      roles: ['user'],
      active: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}
