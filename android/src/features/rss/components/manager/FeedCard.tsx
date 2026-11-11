// src/features/rss/components/manager/FeedCard.tsx
/** One feed provider row in the Manager: identity, refresh schedule, enable switch, and fetch, edit, and delete actions. */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Pencil, RefreshCw, Trash2, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ErrorText, Panel } from "@/components/tool/FormControls";
import { TagList } from "@/components/tool/TagList";
import { messageOf } from "../../lib/errors";
import { fetchFeed } from "../../lib/fetch-feed";
import { formatRelativeTime } from "../../lib/format";
import { openExternal } from "../../lib/links";
import type { RssFeedConfig } from "../../types";

interface FeedCardProps {
  feed: RssFeedConfig;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}

export function FeedCard({ feed, busy, onEdit, onDelete, onToggle }: FeedCardProps) {
  const colors = useThemeColors();
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const disabled = busy || fetching;

  const updated = formatRelativeTime(feed.updatedAt);
  const schedule = updated
    ? `Every ${feed.refreshIntervalMinutes}m · updated ${updated}`
    : `Every ${feed.refreshIntervalMinutes}m`;

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
    <Panel>
      <View style={styles.top}>
        <View style={styles.identity}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {feed.name}
            </Text>
            {!feed.enabled ? (
              <Text style={[styles.badge, { color: colors.mutedForeground, borderColor: colors.border }]}>Disabled</Text>
            ) : null}
          </View>
          <TagList items={feed.category ? [feed.category] : []} />
          <Pressable
            onPress={() => openExternal(feed.url)}
            accessibilityRole="link"
            accessibilityLabel={`Open ${feed.name} feed`}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={[styles.url, { color: colors.primary }]} numberOfLines={1}>
              {feed.url}
            </Text>
          </Pressable>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{schedule}</Text>
        </View>
        <Switch
          value={feed.enabled}
          onValueChange={onToggle}
          disabled={busy}
          accessibilityLabel={`Enable ${feed.name}`}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={runFetch}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Fetch ${feed.name}`}
          accessibilityState={{ busy: fetching, disabled }}
          style={({ pressed }) => [
            styles.fetch,
            { borderColor: colors.border },
            pressed && { backgroundColor: colors.muted },
            disabled && styles.dimmed,
          ]}
        >
          {fetching ? (
            <ActivityIndicator size="small" color={colors.foreground} />
          ) : (
            <RefreshCw size={16} color={colors.foreground} />
          )}
          <Text style={[styles.fetchText, { color: colors.foreground }]}>{fetching ? "Fetching…" : "Fetch"}</Text>
        </Pressable>
        <View style={styles.actions}>
          <IconAction label={`Edit ${feed.name}`} icon={Pencil} onPress={onEdit} disabled={busy} />
          <IconAction label={`Delete ${feed.name}`} icon={Trash2} onPress={onDelete} disabled={busy} destructive />
        </View>
      </View>

      <ErrorText message={statusError} />
      {status ? (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
          {status}
        </Text>
      ) : null}
    </Panel>
  );
}

function IconAction({
  label,
  icon: Icon,
  onPress,
  disabled,
  destructive = false,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled: boolean;
  destructive?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconAction,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.dimmed,
      ]}
    >
      <Icon size={18} color={destructive ? colors.destructive : colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    overflow: "hidden",
  },
  url: {
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  fetch: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  fetchText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconAction: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
  },
  dimmed: {
    opacity: 0.6,
  },
});
