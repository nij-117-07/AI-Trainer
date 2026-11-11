/** RSS Viewer: the filters and the articles from the chosen channels, newest first. Refresh and clear-filters are icon buttons in the top bar. */
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Newspaper, RefreshCw, X } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { useFeedViewer } from "../../hooks/useFeedViewer";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import { DEFAULT_VIEWER_FILTERS } from "../../lib/viewer-filters";
import { VIEWER_PAGE_SIZE } from "../../options";
import type { RssViewerFilters } from "../../types";
import { RssIconButton } from "../RssIconButton";
import { RssTabs } from "../RssTabs";
import { FeedItemCard } from "./FeedItemCard";
import { ViewerFilters } from "./ViewerFilters";

export function RssViewerScreen() {
  const colors = useThemeColors();
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
  const filtersActive = (Object.keys(DEFAULT_VIEWER_FILTERS) as (keyof RssViewerFilters)[]).some(
    (key) => viewer.filters[key] !== DEFAULT_VIEWER_FILTERS[key],
  );

  return (
    <ToolScreen
      title="RSS Viewer"
      usesAi={false}
      wide
      headerRight={
        <View style={styles.headerActions}>
          <RssIconButton
            label="Clear filters"
            icon={X}
            onPress={viewer.resetFilters}
            disabled={!filtersActive}
          />
          <RssIconButton
            label="Refresh feeds"
            icon={RefreshCw}
            onPress={() => void viewer.refresh()}
            disabled={!viewer.hasFeeds}
            loading={viewer.refreshing}
          />
        </View>
      }
    >
      <RssTabs active="viewer" />
      <Section>
        {feeds === null ? (
          feedsError ? (
            <ErrorText message={feedsError} />
          ) : (
            <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.mutedForeground }]}>
              Loading feeds…
            </Text>
          )
        ) : !viewer.hasFeeds ? (
          <EmptyHint icon={Newspaper} title="No feeds yet" hint="Add a feed in the Manager tab to read its articles here." />
        ) : (
          <>
            <ViewerFilters feeds={feeds} filters={viewer.filters} categories={viewer.categories} onChange={viewer.setFilter} />

            {viewer.failures.map((failure) => (
              <ErrorText key={failure.feedId} message={`Could not load ${failure.feedName}: ${failure.message}`} />
            ))}
            <ErrorText message={viewer.error} />

            {viewer.loading ? (
              <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.mutedForeground }]}>
                Loading articles…
              </Text>
            ) : total === 0 ? (
              <EmptyHint
                icon={Newspaper}
                title="No articles match"
                hint={
                  !anyEnabled
                    ? "All feeds are disabled. Enable one in the Manager tab."
                    : viewer.filters.search
                      ? "Try a different search term or a wider time range."
                      : "Your feeds have no posts for the current filters."
                }
              />
            ) : (
              <>
                <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.mutedForeground }]}>
                  {total} {total === 1 ? "article" : "articles"}
                </Text>
                <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {viewer.items.slice(0, shown).map((item, index) => (
                    <FeedItemCard key={`${item.feedId}-${item.guid}`} item={item} divider={index > 0} />
                  ))}
                </View>
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
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  note: {
    ...typeScale.caption,
    paddingHorizontal: spacing.xs,
  },
  group: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
});
