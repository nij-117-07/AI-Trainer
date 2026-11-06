// src/features/auth/lib/password.ts
import bcrypt from 'bcrypt';

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log('[AUTH_DEBUG] Starting password verification...');
  
  try {
    const isMatch = await bcrypt.compare(password, hash);
    console.log(`[AUTH_DEBUG] Password Match Result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('[AUTH_DEBUG] Bcrypt error:', error);
    return false;
  }
}