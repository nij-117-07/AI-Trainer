/** RSS Viewer: the filters and the articles from the chosen channels, newest first. Refresh is in the footer, and Reset clears the filters. */
import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { Newspaper, RefreshCw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { useFeedViewer } from "../../hooks/useFeedViewer";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import { VIEWER_PAGE_SIZE } from "../../options";
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

  return (
    <ToolScreen
      title="RSS Viewer"
      usesAi={false}
      wide
      footerSide={false}
      headerRight={<ResetButton onPress={viewer.resetFilters} />}
      footer={
        viewer.hasFeeds ? (
          <ActionButton
            label={viewer.refreshing ? "Refreshing…" : "Refresh articles"}
            icon={RefreshCw}
            loading={viewer.refreshing}
            onPress={() => void viewer.refresh()}
          />
        ) : null
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
          <EmptyHint
            icon={Newspaper}
            title="No feeds yet"
            hint="Open the Manager tab to add a feed. Then come back here to read its articles."
          />
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
                    ? "All feeds are disabled. Enable one in the Manager to load articles."
                    : viewer.filters.search
                      ? "Try a different search term, or widen the time range."
                      : "Your channels have no posts for the current filters."
                }
              />
            ) : (
              <>
                <Text accessibilityLiveRegion="polite" style={[styles.note, { color: colors.mutedForeground }]}>
                  {total} {total === 1 ? "article" : "articles"}
                </Text>
                <CardGrid>
                  {viewer.items.slice(0, shown).map((item) => (
                    <FeedItemCard key={`${item.feedId}-${item.guid}`} item={item} />
                  ))}
                </CardGrid>
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
  note: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
