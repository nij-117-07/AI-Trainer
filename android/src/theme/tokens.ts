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
  dashboard: 1040,
  sidePanel: 380,
} as const;

/** Corner scale from DESIGN.md section 4.1. */
export const shape = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

/** Type scale from DESIGN.md section 3. Sizes are in sp, line heights are absolute. */
export const typeScale = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700", letterSpacing: -0.6 },
  headline: { fontSize: 24, lineHeight: 32, fontWeight: "600", letterSpacing: -0.3 },
  title: { fontSize: 18, lineHeight: 26, fontWeight: "600", letterSpacing: -0.1 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400", letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.2 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: "600", letterSpacing: 0.8 },
} as const;

/** Inner card padding from DESIGN.md section 5.1: 16 on compact, 20 on medium and up. */
export const cardPadding = {
  compact: 16,
  medium: 20,
} as const;

/** Minimum touch target from DESIGN.md section 13. */
export const touchTarget = 48;
