// src/features/web-search/components/SearchResultCard.tsx
/** One search result: favicon and host, the page title, snippet, and URL. Tapping opens the page in the browser. */
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { cardPadding, shape, spacing, typeScale, useThemeColors } from "@/theme";
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

      <Text style={[styles.title, { color: colors.primary }]} numberOfLines={2}>
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
    borderRadius: shape.lg,
    padding: cardPadding.compact,
    gap: spacing.xs,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rank: {
    ...typeScale.caption,
    fontVariant: ["tabular-nums"],
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: shape.xs,
    borderWidth: 1,
  },
  host: {
    ...typeScale.caption,
    flexShrink: 1,
  },
  title: {
    ...typeScale.title,
  },
  snippet: {
    ...typeScale.body,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  url: {
    ...typeScale.caption,
    flexShrink: 1,
  },
});
