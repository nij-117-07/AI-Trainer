// src/components/tool/tool-slots.ts
/**
 * Lets a component inside a ToolScreen supply its footer or header-right controls without lifting its
 * state into the route. A footer or headerRight prop passed to ToolScreen still wins.
 */
import { createContext, useContext, type ReactNode } from "react";

export interface ToolSlots {
  setFooter: (node: ReactNode) => void;
  setHeaderRight: (node: ReactNode) => void;
}

export const ToolSlotsContext = createContext<ToolSlots | null>(null);

/** Returns the slot setters, or null when no ToolScreen hosts the component. */
export function useToolSlots(): ToolSlots | null {
  return useContext(ToolSlotsContext);
}
