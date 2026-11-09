// src/components/tool/ToolScrollContext.ts
/** Gives tool screens access to the scroll view that ToolScreen renders. */
import { createContext, useContext, type RefObject } from "react";
import type { ScrollViewInstance } from "react-native";

export const ToolScrollContext = createContext<RefObject<ScrollViewInstance | null> | null>(null);

export function useToolScroll() {
  return useContext(ToolScrollContext);
}
