// src/features/roleplay/lib/roles.ts
/**
 * Saved roles (personas) kept on the device. A role's identity is its slug, the lower-case name
 * with spaces as underscores, which is how the backend names its YAML files. Two names with the
 * same slug are the same role.
 */
import { ROLE_NAME_MAX, ROLE_PROMPT_MAX } from "../options";
import type { RoleFormValues, RoleRecord } from "../types";
import { isRecord, listOf, textOf } from "./text";
import { requireText } from "./validate";

export function roleSlug(name: string): string {
  return name.trim().toLowerCase().replace(/ /g, "_");
}

export function validateRole(values: RoleFormValues): RoleRecord {
  return {
    name: requireText(values.name, "Name", ROLE_NAME_MAX),
    prompt: requireText(values.prompt, "Prompt", ROLE_PROMPT_MAX),
  };
}

/** Reads stored roles, skipping damaged entries and duplicate slugs. */
export function normaliseRoles(saved: unknown): RoleRecord[] {
  const seen = new Set<string>();
  const roles: RoleRecord[] = [];
  for (const entry of listOf(saved)) {
    if (!isRecord(entry)) continue;
    const name = textOf(entry.name);
    const prompt = textOf(entry.prompt);
    const key = roleSlug(name);
    if (!name || !prompt || seen.has(key)) continue;
    seen.add(key);
    roles.push({ name, prompt });
  }
  return sortRoles(roles);
}

/** Adds the role, or replaces the prompt of the role with the same slug. */
export function upsertRole(roles: RoleRecord[], role: RoleRecord): RoleRecord[] {
  const key = roleSlug(role.name);
  const exists = roles.some((item) => roleSlug(item.name) === key);
  const next = exists
    ? roles.map((item) => (roleSlug(item.name) === key ? { name: item.name, prompt: role.prompt } : item))
    : [...roles, role];
  return sortRoles(next);
}

export function removeRole(roles: RoleRecord[], name: string): RoleRecord[] {
  const key = roleSlug(name);
  return roles.filter((item) => roleSlug(item.name) !== key);
}

export function findRole(roles: RoleRecord[], name: string): RoleRecord | undefined {
  const key = roleSlug(name);
  return roles.find((item) => roleSlug(item.name) === key);
}

export function sortRoles(roles: RoleRecord[]): RoleRecord[] {
  return [...roles].sort((a, b) => roleSlug(a.name).localeCompare(roleSlug(b.name)));
}
