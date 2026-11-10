/** RSS Manager list: the saved feed providers, with enable, fetch, edit, and delete. Add and edit happen on their own pages. */
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus, Settings2 } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { messageOf } from "../../lib/errors";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import type { RssFeedConfig } from "../../types";
import { RssTabs } from "../RssTabs";
import { FeedCard } from "./FeedCard";

export function RssManagerScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { feeds, error, busyId, reload, update, remove } = useRssFeeds();
  const [notice, setNotice] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const list = feeds ?? [];

  async function handleToggle(feed: RssFeedConfig, enabled: boolean) {
    setNotice(null);
    try {
      await update(feed.id, { enabled });
    } catch (cause) {
      setNotice(messageOf(cause, "Could not update the feed."));
    }
  }

  function confirmDelete(feed: RssFeedConfig) {
    Alert.alert(
      "Delete this feed?",
      `"${feed.name}" will be removed along with its cached items. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotice(null);
            remove(feed.id).catch((cause: unknown) => setNotice(messageOf(cause, "Could not delete the feed.")));
          },
        },
      ],
    );
  }

  return (
    <ToolScreen
      title="RSS Manager"
      usesAi={false}
      footer={<ActionButton label="Add feed" icon={Plus} onPress={() => router.push("/tools/rss/manager/new")} />}
    >
      <RssTabs active="manager" />
      <Section>
        <ErrorText message={notice ?? error} />

        {feeds === null ? (
          error ? null : <Text style={[styles.note, { color: colors.mutedForeground }]}>Loading feeds…</Text>
        ) : list.length === 0 ? (
          <EmptyHint
            icon={Settings2}
            title="No feeds yet"
            hint="Tap Add feed below. Any blog, news site, or RSS or Atom feed works."
          />
        ) : (
          list.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              busy={busyId === feed.id}
              onEdit={() => router.push({ pathname: "/tools/rss/manager/edit", params: { feedId: feed.id } })}
              onDelete={() => confirmDelete(feed)}
              onToggle={(enabled) => void handleToggle(feed, enabled)}
            />
          ))
        )}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  note: {
    fontSize: 14,
    lineHeight: 21,
  },
});
