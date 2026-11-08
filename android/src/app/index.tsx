// src/app/index.tsx
/**
 * Entry route. Opens the dashboard directly.
 */
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/dashboard" />;
}
