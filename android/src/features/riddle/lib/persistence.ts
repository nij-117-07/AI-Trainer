// src/features/riddle/lib/persistence.ts
/** Storage keys for the Riddle Generator. The setup form and the active round never share a key. */
export const RIDDLE_STORAGE_KEYS = {
  form: "practice.riddle.form.v1",
  round: "practice.riddle.round.v1",
} as const;
