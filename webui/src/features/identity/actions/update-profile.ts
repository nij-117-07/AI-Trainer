// src/features/identity/actions/update-profile.ts
"use server"

import { validateIdentity } from "../lib/auth-guard";

/**
 * Example Server Action protected by Identity Guard
 */
export async function updateUserSettings(formData: FormData) {
  // CRITICAL: Verify headers before any logic
  const user = await validateIdentity();
  
  console.log(`Action performed by: ${user.username}`);
  
  try {
    // Perform your API calls/DB updates here
    // const response = await fetch(process.env.API_URL, { ... })
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update" };
  }
}