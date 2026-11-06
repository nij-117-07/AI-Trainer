// src/features/auth/lib/captcha.ts
/**
 * Server-side CAPTCHA generation and verification.
 * Uses HMAC-SHA256 stored in an HTTP-only cookie for one-time validation.
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'captcha_code';
const CODE_LENGTH = 6;
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EXPIRY_SECONDS = 120;

function getSecret(): string {
  return process.env.JWT_SECRET || 'captcha-default-secret-change-me';
}

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

function hashValue(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export async function createCaptcha(): Promise<string> {
  const code = generateCode();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, hashValue(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_SECONDS,
    path: '/',
  });
  return code;
}

export async function verifyCaptcha(input: string): Promise<boolean> {
  if (!input) return false;
  const cookieStore = await cookies();
  const storedHash = cookieStore.get(COOKIE_NAME)?.value;
  if (!storedHash) return false;
  cookieStore.delete(COOKIE_NAME);
  return hashValue(input.toUpperCase()) === storedHash;
}
