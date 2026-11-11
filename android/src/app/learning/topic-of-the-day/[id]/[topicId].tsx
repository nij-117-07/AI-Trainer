// src/app/learning/topic-of-the-day/[id]/[topicId].tsx
/** One saved topic on its own page, with its focus and date and a delete button in the footer. */
import { Alert, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Layers, Trash2 } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TopicSections } from "@/features/topic-of-the-day/components/TopicSections";
import { showSaveError, useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteTopics } from "@/features/topic-of-the-day/lib/library";

export default function TopicDetailRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const { library, loaded, change } = useTopicLibrary();
  const topic = library.topics.find((item) => item.id === topicId && item.broadId === id);

  if (loaded && !topic) {
    return (
      <ToolScreen title="Topic">
        <EmptyHint icon={Layers} title="Topic not found" hint="It may have been deleted. Go back to the list." />
      </ToolScreen>
    );
  }

  function confirmDelete() {
    if (!topic) return;
    Alert.alert("Delete this topic?", `"${topic.title || "Untitled topic"}" will be removed. This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          void change((current) => deleteTopics(current, [topic.id]))
            .then(() => router.back())
            .catch(showSaveError),
      },
    ]);
  }

  const meta = topic ? [topic.focus, topic.date].filter(Boolean).join(" · ") : "";

  return (
    <ToolScreen
      title={topic?.title || "Topic"}
      footer={<ActionButton label="Delete topic" icon={Trash2} variant="outline" disabled={!topic} onPress={confirmDelete} />}
    >
      {topic ? (
        <Section>
          {meta ? <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta}</Text> : null}
          <TopicSections topic={topic} />
        </Section>
      ) : null}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontSize: 13,
    marginBottom: spacing.xs,
  },
});
