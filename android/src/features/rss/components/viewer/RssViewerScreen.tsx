// src/features/rss/components/viewer/RssViewerScreen.tsx
/** RSS Viewer: loads the chosen channel, applies the filters, and lists articles newest first. */
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useFeedViewer } from "../../hooks/useFeedViewer";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import { VIEWER_PAGE_SIZE } from "../../options";
import { RssTabs } from "../RssTabs";
import { FeedItemCard } from "./FeedItemCard";
import { ViewerFilters } from "./ViewerFilters";

export function RssViewerScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { feeds, error: feedsError, reload } = useRssFeeds();
  const viewer = useFeedViewer(feeds);
  const [shown, setShown] = useState(VIEWER_PAGE_SIZE);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const total = viewer.items.length;
  const anyEnabled = (feeds ?? []).some((feed) => feed.enabled);

  return (
    <ToolScreen title="RSS Viewer">
      <RssTabs active="viewer" />
      <Section>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>RSS Viewer</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Browse the latest posts from your configured channels.
          </Text>
          <ActionButton
            label="Refresh"
            icon={RefreshCw}
            variant="outline"
            loading={viewer.refreshing}
            onPress={() => void viewer.refresh()}
          />
        </View>

        {feeds === null ? (
          feedsError ? (
            <ErrorText message={feedsError} />
          ) : (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Loading feeds…</Text>
          )
        ) : !viewer.hasFeeds ? (
          <Panel>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No feeds yet</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Head to the Manager to add a provider, then come back here to browse its articles.
            </Text>
            <ActionButton label="Open Manager" variant="outline" onPress={() => router.replace("/tools/rss/manager")} />
          </Panel>
        ) : (
          <>
            <ViewerFilters
              feeds={feeds}
              filters={viewer.filters}
              categories={viewer.categories}
              onChange={viewer.setFilter}
            />

            {viewer.failures.map((failure) => (
              <ErrorText
                key={failure.feedId}
                message={`Could not load ${failure.feedName}: ${failure.message}`}
              />
            ))}
            <ErrorText message={viewer.error} />

            {viewer.loading ? (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Loading articles…</Text>
            ) : total === 0 ? (
              <Panel>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No articles match</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  {!anyEnabled
                    ? "All feeds are disabled. Enable one in the Manager to load articles."
                    : viewer.filters.search
                      ? "Try a different search term or widen the time range."
                      : "Your channels have no posts for the current filters."}
                </Text>
              </Panel>
            ) : (
              <>
                <Text style={[styles.count, { color: colors.mutedForeground }]}>
                  {total} {total === 1 ? "article" : "articles"}
                </Text>
                {viewer.items.slice(0, shown).map((item) => (
                  <FeedItemCard key={`${item.feedId}-${item.guid}`} item={item} />
                ))}
                {total > shown ? (
                  <ActionButton
                    label={`Show more (${total - shown} left)`}
                    variant="outline"
                    onPress={() => setShown((count) => count + VIEWER_PAGE_SIZE)}
                  />
                ) : null}
              </>
            )}
          </>
        )}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  count: {
    fontSize: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
