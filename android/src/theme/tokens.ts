// src/theme/tokens.ts
/**
 * Radius, spacing, and breakpoint tokens. Values follow webui --radius (1.3rem ≈ 21px)
 * and the breakpoints in webui/src/page_layout.md.
 */

export const radius = {
  md: 19,
  lg: 21,
  xl: 25,
  "2xl": 37,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const breakpoints = {
  tablet: 640,
  desktop: 1024,
} as const;

export const contentWidth = {
  form: 720,
  wide: 1100,
} as const;
