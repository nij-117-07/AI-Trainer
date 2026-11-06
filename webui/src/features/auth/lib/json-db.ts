// src/features/auth/lib/json-db.ts
/**
 * Low-level JSON file operations for user storage.
 * Handles both direct-array and { users: [] } JSON structures.
 * Provides read and write operations for the user database.
 */

import { promises as fs } from 'fs';
import { UserRecord } from '@/features/identity/types';

function getDbPath(): string {
  return process.env.USERS_JSON_PATH || './data/users.json';
}

/**
 * Reads and parses the JSON database file.
 * Handles both array and { users: [] } structures.
 */
async function readDb(): Promise<UserRecord[]> {
  const path = getDbPath();
  try {
    const data = await fs.readFile(path, 'utf-8');
    const db = JSON.parse(data);
    const users = Array.isArray(db) ? db : db.users;
    return users ?? [];
  } catch (error) {
    console.error(`[DB] Failed to read ${path}:`, error);
    return [];
  }
}

/**
 * Writes the full users array back to the JSON database.
 * Preserves the original file structure (array vs object).
 */
async function writeDb(users: UserRecord[]): Promise<void> {
  const path = getDbPath();
  try {
    const data = await fs.readFile(path, 'utf-8');
    const db = JSON.parse(data);
    if (Array.isArray(db)) {
      await fs.writeFile(path, JSON.stringify(users, null, 2), 'utf-8');
    } else {
      await fs.writeFile(path, JSON.stringify({ ...db, users }, null, 2), 'utf-8');
    }
  } catch {
    // If we can't read the file, write as direct array
    await fs.writeFile(path, JSON.stringify(users, null, 2), 'utf-8');
  }
}

/**
 * Retrieves all users from the JSON database.
 */
export async function getUsers(): Promise<UserRecord[]> {
  return readDb();
}

/**
 * Finds a single user by username.
 */
export async function findUserByUsername(username: string): Promise<UserRecord | undefined> {
  const users = await readDb();
  return users.find(u => u.username === username);
}

/**
 * Adds a new user to the database. Throws if username already exists.
 */
export async function addUser(user: UserRecord): Promise<void> {
  const users = await readDb();
  if (users.some(u => u.username === user.username)) {
    throw new Error(`User '${user.username}' already exists`);
  }
  users.push(user);
  await writeDb(users);
}

/**
 * Updates specific fields of an existing user. Throws if not found.
 */
export async function updateUser(
  username: string,
  updates: Partial<Pick<UserRecord, 'email' | 'passwordHash' | 'roles' | 'active'>>
): Promise<UserRecord> {
  const users = await readDb();
  const index = users.findIndex(u => u.username === username);
  if (index === -1) {
    throw new Error(`User '${username}' not found`);
  }
  users[index] = { ...users[index], ...updates };
  await writeDb(users);
  return users[index];
}