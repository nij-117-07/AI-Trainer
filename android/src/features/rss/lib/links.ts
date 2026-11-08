// src/features/rss/lib/links.ts
/** Opens feed and article links in the system browser, but only for http(s) URLs. */
import { Linking } from "react-native";
import { isHttpUrl } from "./validation";

export function openExternal(url: string): void {
  if (!isHttpUrl(url)) return;
  Linking.openURL(url.trim()).catch(() => undefined);
}
