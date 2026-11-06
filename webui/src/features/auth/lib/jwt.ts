// src/features/auth/lib/jwt.ts
/**
 * JWT signing and verification using 'jose' for Edge Runtime compatibility.
 * Secret must be provided via JWT_SECRET env var.
 */

import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/features/identity/types';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth_token';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this-secret-in-production'
);

/**
 * Creates a signed JWT for the given user.
 * Expires in 7 days.
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT string and returns the payload.
 * Throws if invalid or expired.
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

/**
 * Retrieves and verifies the JWT from the HTTP-only cookie.
 * Returns null if missing or invalid.
 */
export async function getTokenFromCookie(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets the HTTP-only cookie with the JWT.
 * Secure flag auto-enabled in production.
 */
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

/**
 * Clears the auth cookie (logout).
 */
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}