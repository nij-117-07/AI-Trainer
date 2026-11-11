// src/features/web-search/components/SearchResultCard.tsx
/** One search result: favicon and host, the page title, snippet, and URL. Tapping opens the page in the browser. */
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { WebSearchResult } from "../types";

interface SearchResultCardProps {
  result: WebSearchResult;
  rank: number;
}

/** Google's public favicon service, the same source the webui uses. */
function faviconUrl(host: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
}

export function SearchResultCard({ result, rank }: SearchResultCardProps) {
  const colors = useThemeColors();

  function openResult() {
    Linking.openURL(result.url).catch(() => Alert.alert("Could not open link", result.url));
  }

  return (
    <Pressable
      onPress={openResult}
      accessibilityRole="link"
      accessibilityLabel={`${result.title || result.url}, ${result.host}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.hostRow}>
        <Text style={[styles.rank, { color: colors.mutedForeground }]}>{rank}.</Text>
        {result.host ? (
          <Image
            source={{ uri: faviconUrl(result.host) }}
            style={[styles.favicon, { borderColor: colors.border, backgroundColor: colors.muted }]}
          />
        ) : null}
        <Text style={[styles.host, { color: colors.mutedForeground }]} numberOfLines={1}>
          {result.host}
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.primary }]} numberOfLines={3}>
        {result.title || result.url}
      </Text>

      {result.snippet ? (
        <Text style={[styles.snippet, { color: colors.mutedForeground }]} numberOfLines={3}>
          {result.snippet}
        </Text>
      ) : null}

      <View style={styles.urlRow}>
        <ExternalLink size={12} color={colors.mutedForeground} />
        <Text style={[styles.url, { color: colors.mutedForeground }]} numberOfLines={1}>
          {result.url}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rank: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
  },
  host: {
    flexShrink: 1,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  snippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  url: {
    flexShrink: 1,
    fontSize: 12,
  },
});
