// src/features/rss/components/manager/RssManagerScreen.tsx
/** RSS Manager: lists the saved feed providers and handles add, edit, enable, fetch, and delete. */
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { messageOf } from "../../lib/errors";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import type { RssFeedConfig, RssFeedInput } from "../../types";
import { RssTabs } from "../RssTabs";
import { FeedCard } from "./FeedCard";
import { FeedFormModal } from "./FeedFormModal";

export function RssManagerScreen() {
  const colors = useThemeColors();
  const { feeds, error, busyId, reload, create, update, remove } = useRssFeeds();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RssFeedConfig | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const list = feeds ?? [];

  function openCreate() {
    setEditing(null);
    setNotice(null);
    setFormOpen(true);
  }

  function openEdit(feed: RssFeedConfig) {
    setEditing(feed);
    setNotice(null);
    setFormOpen(true);
  }

  async function handleSave(input: RssFeedInput) {
    if (editing) {
      await update(editing.id, input);
    } else {
      await create(input);
    }
    setFormOpen(false);
  }

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
    <ToolScreen title="RSS Manager">
      <RssTabs active="manager" />
      <Section>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>RSS Feed Manager</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Configure the RSS and Atom providers that power the viewer.
          </Text>
        </View>

        <ActionButton label="Add feed" icon={Plus} onPress={openCreate} />
        <ErrorText message={notice ?? error} />

        {feeds === null ? (
          error ? null : <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Loading feeds…</Text>
        ) : list.length === 0 ? (
          <Panel>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No feeds configured yet</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Add your first provider — a blog, news site, or any RSS/Atom feed — to start curating content.
            </Text>
          </Panel>
        ) : (
          list.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              busy={busyId === feed.id}
              onEdit={() => openEdit(feed)}
              onDelete={() => confirmDelete(feed)}
              onToggle={(enabled) => void handleToggle(feed, enabled)}
            />
          ))
        )}
      </Section>

      <FeedFormModal
        visible={formOpen}
        feed={editing}
        busy={busyId === "new" || (editing !== null && busyId === editing.id)}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
