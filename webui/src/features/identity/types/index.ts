// src/features/identity/types/index.ts
/**
 * Core identity types supporting both Proxy Header Auth and JWT Session Auth.
 * UserIdentity is the universal interface consumed by the application.
 */

/**
 * Represents the authenticated user identity returned by the auth guard.
 * Used universally across the app regardless of auth method (Proxy or JWT).
 */
export interface UserIdentity {
  username: string;
  email: string;
  groups: string[];
  logoutUrl: string;
}

/**
 * Database record structure for local JSON storage.
 * Contains sensitive hashed password - never expose to client.
 */
export interface UserRecord {
  username: string;
  email: string;
  passwordHash: string;
  roles: string[];
  active: boolean;
  createdAt: string;
}

/**
 * JWT Payload structure for session tokens.
 * Mirrors UserIdentity but uses 'roles' instead of 'groups' for consistency with RBAC.
 */
export interface JWTPayload {
  username: string;
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}