// src/features/rss/components/manager/FeedCard.tsx
/** One feed provider row in the Manager: name, URL, enable switch, and icon actions to fetch, edit, and delete. */
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Pencil, RefreshCw, Trash2 } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { messageOf } from "../../lib/errors";
import { fetchFeed } from "../../lib/fetch-feed";
import { openExternal } from "../../lib/links";
import type { RssFeedConfig } from "../../types";
import { RssIconButton } from "../RssIconButton";

interface FeedCardProps {
  feed: RssFeedConfig;
  busy: boolean;
  divider: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

export function FeedCard({ feed, busy, divider, onEdit, onDelete, onToggle }: FeedCardProps) {
  const colors = useThemeColors();
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const disabled = busy || fetching;

  async function runFetch() {
    setFetching(true);
    setStatus(null);
    setStatusError(null);
    try {
      const result = await fetchFeed(feed, { bypassCache: true });
      const from = result.source.title ? ` from ${result.source.title}` : "";
      setStatus(`Fetched ${result.items.length} items${from}.`);
    } catch (cause) {
      setStatusError(messageOf(cause, "Could not fetch the feed."));
    } finally {
      setFetching(false);
    }
  }

  return (
    <View style={[styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={styles.top}>
        <View style={styles.identity}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {feed.name}
            </Text>
            {feed.category ? (
              <Text style={[styles.category, { color: colors.mutedForeground }]} numberOfLines={1}>
                {feed.category}
              </Text>
            ) : null}
            {!feed.enabled ? (
              <Text style={[styles.badge, { color: colors.mutedForeground, borderColor: colors.border }]}>Disabled</Text>
            ) : null}
          </View>
        </View>
        <Switch
          value={feed.enabled}
          onValueChange={onToggle}
          disabled={busy}
          accessibilityRole="switch"
          accessibilityLabel={`Enable feed ${feed.name}`}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => openExternal(feed.url)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${feed.name} feed`}
          style={styles.url}
        >
          <Text style={[styles.urlText, { color: colors.primary }]} numberOfLines={1}>
            {feed.url}
          </Text>
        </Pressable>
        <View style={styles.actions}>
          <RssIconButton
            label={fetching ? `Fetching feed ${feed.name}` : `Fetch feed ${feed.name}`}
            icon={RefreshCw}
            onPress={runFetch}
            disabled={disabled}
            loading={fetching}
          />
          <RssIconButton label={`Edit feed ${feed.name}`} icon={Pencil} onPress={onEdit} disabled={busy} />
          <RssIconButton label={`Delete feed ${feed.name}`} icon={Trash2} onPress={onDelete} disabled={busy} destructive />
        </View>
      </View>

      <ErrorText message={statusError} />
      {status ? (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
          {status}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  identity: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    ...typeScale.body,
    flexShrink: 1,
    fontWeight: "600",
  },
  category: {
    ...typeScale.caption,
    flexShrink: 1,
  },
  badge: {
    ...typeScale.caption,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  url: {
    flex: 1,
  },
  urlText: {
    ...typeScale.caption,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  status: {
    ...typeScale.caption,
  },
});
