// src/components/providers/ThemeProvider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider wraps the application to provide dark/light mode context.
 * It is marked 'use client' to handle browser-side theme detection.
 * next-themes injects a <script> tag for FOUC prevention — the React
 * warning about it is benign; the script is server-rendered and works as intended.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}