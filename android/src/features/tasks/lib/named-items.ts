// src/features/tasks/lib/named-items.ts
/** Reads stored projects and labels, repairing or dropping entries that are not usable. */
import type { NamedItem } from "../types";

export function normalizeNamedItems<T extends NamedItem>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): T[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<NamedItem>;
    if (typeof raw.id !== "string" || typeof raw.name !== "string" || !raw.name.trim()) return [];
    const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString();
    return [{ id: raw.id, name: raw.name.trim(), createdAt } as T];
  });
}
