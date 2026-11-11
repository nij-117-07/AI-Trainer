// src/app/learning/topic-of-the-day/[id]/index.tsx
/**
 * The topics under one broader topic. Tapping a topic opens its own page. "Select" in the header
 * switches to selection mode, where rows are picked and deleted together from the footer.
 */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Layers, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TopicRow } from "@/features/topic-of-the-day/components/TopicRow";
import { showSaveError, useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteTopics, findBroadTopic, topicsFor } from "@/features/topic-of-the-day/lib/library";

export default function BroadTopicRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { library, loaded, change } = useTopicLibrary();
  const broad = findBroadTopic(library, id);
  const topics = broad ? topicsFor(library, broad.id) : [];
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = topics.length > 0 && selected.length === topics.length;

  function leaveSelection() {
    setSelecting(false);
    setSelected([]);
  }

  function toggle(topicId: string) {
    setSelected((prev) => (prev.includes(topicId) ? prev.filter((item) => item !== topicId) : [...prev, topicId]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : topics.map((topic) => topic.id));
  }

  function confirmDelete() {
    const count = selected.length;
    const ids = selected;
    Alert.alert(`Delete ${count} ${count === 1 ? "topic" : "topics"}?`, "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void change((current) => deleteTopics(current, ids)).then(leaveSelection).catch(showSaveError),
      },
    ]);
  }

  if (loaded && !broad) {
    return (
      <ToolScreen title="Topics">
        <EmptyHint icon={Layers} title="Broader topic not found" hint="It may have been deleted. Go back to the list." />
      </ToolScreen>
    );
  }

  const headerRight =
    topics.length > 0 ? (
      <Pressable
        onPress={selecting ? leaveSelection : () => setSelecting(true)}
        accessibilityRole="button"
        accessibilityLabel={selecting ? "Cancel selection" : "Select topics"}
        style={styles.headerAction}
      >
        <Text style={[styles.headerActionText, { color: colors.primary }]}>{selecting ? "Cancel" : "Select"}</Text>
      </Pressable>
    ) : undefined;

  const footer = selecting ? (
    <ActionButton
      label={selected.length > 0 ? `Delete ${selected.length} selected` : "Delete selected"}
      icon={Trash2}
      variant="outline"
      disabled={selected.length === 0}
      onPress={confirmDelete}
    />
  ) : (
    <ActionButton label="New topic" icon={CalendarDays} onPress={() => router.push(`/learning/topic-of-the-day/${id}/new`)} />
  );

  return (
    <ToolScreen title={broad?.name ?? "Topics"} headerRight={headerRight} footer={footer}>
      <Section>
        {selecting && topics.length > 0 ? (
          <View style={styles.selectBar}>
            <Pressable onPress={toggleAll} accessibilityRole="button" accessibilityLabel={allSelected ? "Clear selection" : "Select all topics"}>
              <Text style={[styles.selectAll, { color: colors.primary }]}>{allSelected ? "Clear selection" : "Select all"}</Text>
            </Pressable>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {selected.length} of {topics.length} selected
            </Text>
          </View>
        ) : null}

        {loaded && topics.length === 0 ? (
          <EmptyHint
            icon={CalendarDays}
            title="No topics yet"
            hint="Tap New topic below, choose a focus and level, then generate."
          />
        ) : (
          <View style={styles.list}>
            {topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                selecting={selecting}
                selected={selected.includes(topic.id)}
                onPress={() => (selecting ? toggle(topic.id) : router.push(`/learning/topic-of-the-day/${id}/${topic.id}`))}
              />
            ))}
          </View>
        )}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerActionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectAll: {
    fontSize: 15,
    fontWeight: "600",
  },
  count: {
    fontSize: 13,
  },
  list: {
    gap: spacing.sm,
  },
});
