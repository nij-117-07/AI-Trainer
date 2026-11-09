// src/features/dharma-instructor/lib/validate.ts
/** Input check for the Dharma instructor. Rejects empty or overlong messages before the model call. */

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}
