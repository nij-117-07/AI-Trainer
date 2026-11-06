// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_LOCAL_OIDC_URL: z.string().url(),
  NEXT_PUBLIC_CLIENT_ID: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  // Only validate secret if we are on the server
  AUTH_CLIENT_SECRET: z.string().optional(), 
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_LOCAL_OIDC_URL: process.env.NEXT_PUBLIC_LOCAL_OIDC_URL,
  NEXT_PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;