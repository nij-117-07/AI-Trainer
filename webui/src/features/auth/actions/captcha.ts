// src/features/auth/actions/captcha.ts
/**
 * Server action for CAPTCHA code generation.
 * Client components call this to get a new CAPTCHA code.
 */

'use server';

import { createCaptcha } from '../lib/captcha';

export async function fetchCaptcha(): Promise<string> {
  return createCaptcha();
}
