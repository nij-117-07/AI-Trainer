// src/features/rss/components/viewer/FeedItemCard.tsx
/** One article in the viewer: thumbnail when the feed provides one, source and time, linked title, snippet, and tags. */
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { TagList } from "@/components/tool/TagList";
import { formatRelativeTime, truncate } from "../../lib/format";
import { openExternal } from "../../lib/links";
import { isHttpUrl } from "../../lib/validation";
import type { RssFeedItem } from "../../types";

export function FeedItemCard({ item }: { item: RssFeedItem }) {
  const colors = useThemeColors();
  const canOpen = isHttpUrl(item.link);
  const mediaUrl = item.media && isHttpUrl(item.media.url) ? item.media.url : "";
  const categories = Array.isArray(item.categories) ? item.categories.slice(0, 4) : [];
  const snippet = truncate(item.description, 220);
  const when = formatRelativeTime(item.pubDate);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {mediaUrl ? (
        <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : null}

      <View style={styles.meta}>
        <Text style={[styles.source, { color: colors.foreground }]} numberOfLines={1}>
          {item.feedName || "Feed"}
        </Text>
        {item.author ? (
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            · {item.author}
          </Text>
        ) : null}
        {when ? <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{when}</Text> : null}
      </View>

      <Pressable
        onPress={() => openExternal(item.link)}
        disabled={!canOpen}
        accessibilityRole="link"
        accessibilityState={{ disabled: !canOpen }}
      >
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
          {item.title}
        </Text>
      </Pressable>

      {snippet ? (
        <Text style={[styles.snippet, { color: colors.mutedForeground }]} numberOfLines={3}>
          {snippet}
        </Text>
      ) : null}

      <TagList items={categories} />

      {canOpen ? (
        <Pressable
          onPress={() => openExternal(item.link)}
          accessibilityRole="link"
          accessibilityLabel={`Read more: ${item.title}`}
          style={styles.readMore}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <ExternalLink size={14} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Read more</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  media: {
    width: "100%",
    height: 160,
    borderRadius: radius.lg,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  source: {
    fontSize: 13,
    fontWeight: "600",
  },
  metaText: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  snippet: {
    fontSize: 14,
    lineHeight: 21,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
  },
});
