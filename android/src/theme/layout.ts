// src/theme/layout.ts
/**
 * Screen-size class for the current window. Phones are the base layout; tablets and desktop
 * (Windows build) add columns and cap the content width.
 */
import { useWindowDimensions } from "react-native";
import { breakpoints } from "./tokens";

export type LayoutSize = "phone" | "tablet" | "desktop";

export function useLayout() {
  const { width } = useWindowDimensions();
  const size: LayoutSize = width >= breakpoints.desktop ? "desktop" : width >= breakpoints.tablet ? "tablet" : "phone";
  return { width, size, isTablet: size !== "phone", isDesktop: size === "desktop" };
}
