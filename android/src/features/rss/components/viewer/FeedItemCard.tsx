// src/features/rss/components/viewer/FeedItemCard.tsx
/** One article row in the viewer, shaped like a news list: linked title, then source, author, and time. Tapping the row opens the article. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalLink } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { formatRelativeTime } from "../../lib/format";
import { openExternal } from "../../lib/links";
import { isHttpUrl } from "../../lib/validation";
import type { RssFeedItem } from "../../types";

export function FeedItemCard({ item, divider }: { item: RssFeedItem; divider: boolean }) {
  const colors = useThemeColors();
  const canOpen = isHttpUrl(item.link);
  const meta = [item.feedName || "Feed", item.author, formatRelativeTime(item.pubDate)].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={() => openExternal(item.link)}
      disabled={!canOpen}
      accessibilityRole="link"
      accessibilityLabel={meta ? `${item.title}, ${meta}` : item.title}
      accessibilityState={{ disabled: !canOpen }}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {canOpen ? <ExternalLink size={16} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.body,
    fontWeight: "600",
  },
  meta: {
    ...typeScale.caption,
  },
});
