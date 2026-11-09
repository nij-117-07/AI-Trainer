// src/features/brain-dump/lib/ids.ts

export function newId(now: number = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
