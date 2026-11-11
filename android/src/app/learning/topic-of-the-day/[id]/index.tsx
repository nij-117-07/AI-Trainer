// src/app/learning/topic-of-the-day/[id]/index.tsx
/**
 * The topics under one broader topic. Tapping a topic opens its own page. "Select" in the header
 * switches to selection mode, where rows are picked and deleted together from the footer.
 */
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Layers, Trash2 } from "lucide-react-native";
import { spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { TopicRow } from "@/features/topic-of-the-day/components/TopicRow";
import { useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteTopics, findBroadTopic, topicsFor } from "@/features/topic-of-the-day/lib/library";

export default function BroadTopicRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { library, loaded, pending, removeLater, undo, dismiss } = useTopicLibrary();
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

  function deleteSelected() {
    const count = selected.length;
    const ids = selected;
    removeLater({
      message: `Deleted ${count} ${count === 1 ? "topic" : "topics"}`,
      apply: (current) => deleteTopics(current, ids),
    });
    leaveSelection();
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
      onPress={deleteSelected}
    />
  ) : (
    <ActionButton label="New topic" icon={CalendarDays} onPress={() => router.push(`/learning/topic-of-the-day/${id}/new`)} />
  );

  return (
    <ToolScreen title={broad?.name ?? "Topics"} headerRight={headerRight} footer={footer} wide usesAi={false}>
      <Section>
        {selecting && topics.length > 0 ? (
          <View style={styles.selectBar}>
            <Pressable
              onPress={toggleAll}
              accessibilityRole="button"
              accessibilityLabel={allSelected ? "Clear selection" : "Select all topics"}
              style={styles.selectAllButton}
            >
              <Text style={[styles.selectAll, { color: colors.primary }]}>{allSelected ? "Clear selection" : "Select all"}</Text>
            </Pressable>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {selected.length} of {topics.length} selected
            </Text>
          </View>
        ) : null}

        {!loaded ? (
          <ActivityIndicator color={colors.primary} />
        ) : topics.length === 0 ? (
          <EmptyHint
            icon={CalendarDays}
            title="No topics yet"
            hint="Get a focused topic for today inside this area."
          />
        ) : (
          <CardGrid>
            {topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                selecting={selecting}
                selected={selected.includes(topic.id)}
                onPress={() => (selecting ? toggle(topic.id) : router.push(`/learning/topic-of-the-day/${id}/${topic.id}`))}
              />
            ))}
          </CardGrid>
        )}

        {pending ? <UndoSnackbar message={pending.message} onUndo={undo} onDismiss={dismiss} /> : null}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  headerActionText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  selectBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectAllButton: {
    minHeight: touchTarget,
    justifyContent: "center",
  },
  selectAll: {
    ...typeScale.label,
    fontWeight: "600",
  },
  count: {
    ...typeScale.caption,
  },
});
