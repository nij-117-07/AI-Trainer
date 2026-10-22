// src/features/auth/actions/login.ts
'use server';

import { findUserByUsername } from '../lib/json-db';
import { verifyPassword } from '../lib/password';
import { createToken, setTokenCookie } from '../lib/jwt';
import { verifyCaptcha } from '../lib/captcha';

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const captcha = formData.get('captcha') as string;

  if (!(await verifyCaptcha(captcha))) {
    return { success: false, error: 'Invalid CAPTCHA. Please try again.' };
  }

  console.log(`[AUTH_DEBUG] Login attempt for user: ${username}`);

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      console.log(`[AUTH_DEBUG] Failure: User '${username}' not found in database.`);
      return { success: false, error: 'Invalid credentials' };
    }

    console.log(`[AUTH_DEBUG] User found. Stored hash: ${user.passwordHash.substring(0, 10)}...`);

    if (!user.active) {
      console.log(`[AUTH_DEBUG] Failure: User '${username}' is deactivated.`);
      return { success: false, error: 'Account is deactivated. Contact an administrator.' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      console.log(`[AUTH_DEBUG] Failure: Password mismatch for user '${username}'.`);
      return { success: false, error: 'Invalid credentials' };
    }

    console.log(`[AUTH_DEBUG] Success: Password verified. Generating token...`);
    const token = await createToken({
      username: user.username,
      email: user.email,
      roles: user.roles,
    });

    await setTokenCookie(token);
    return { success: true };
  } catch (error) {
    console.error('[AUTH_DEBUG] Unexpected error during login flow:', error);
    return { success: false, error: 'Internal server error' };
  }
}