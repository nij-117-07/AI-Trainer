// src/components/tool/snackbar-slot.ts
/** Lets a snackbar inside a ToolScreen draw at the bottom of the screen, above the footer. */
import { createContext, useContext, type ReactNode } from "react";

export const SnackbarSlotContext = createContext<((node: ReactNode) => void) | null>(null);

/** Returns the slot setter, or null when no ToolScreen hosts the snackbar. */
export function useSnackbarSlot(): ((node: ReactNode) => void) | null {
  return useContext(SnackbarSlotContext);
}
