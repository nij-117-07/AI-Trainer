// src/app/learning/topic-of-the-day/[id]/[topicId].tsx
/** One saved topic on its own page. Today's task leads, then the reading parts. Delete is an icon in the top bar. */
import { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Layers, Trash2 } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { IconAction } from "@/features/topic-of-the-day/components/IconAction";
import { TopicHero, TopicSections } from "@/features/topic-of-the-day/components/TopicSections";
import { useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteTopics } from "@/features/topic-of-the-day/lib/library";

export default function TopicDetailRoute() {
  const router = useRouter();
  const { id, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const { library, loaded, pending, removeLater, undo, dismiss } = useTopicLibrary();
  const [leaving, setLeaving] = useState(false);
  const topic = library.topics.find((item) => item.id === topicId && item.broadId === id);

  const leave = useCallback(() => {
    setLeaving(true);
    dismiss();
    router.back();
  }, [dismiss, router]);

  if (loaded && !topic && !pending && !leaving) {
    return (
      <ToolScreen title="Topic" usesAi={false}>
        <EmptyHint icon={Layers} title="Topic not found" hint="It may have been deleted. Go back to the list." />
      </ToolScreen>
    );
  }

  function deleteTopic() {
    if (!topic) return;
    removeLater({
      message: `Deleted topic ${topic.title || "Untitled topic"}`,
      apply: (current) => deleteTopics(current, [topic.id]),
    });
  }

  return (
    <ToolScreen
      title={topic?.title || "Topic"}
      usesAi={false}
      headerRight={
        topic ? (
          <IconAction icon={Trash2} label={`Delete topic ${topic.title || "Untitled topic"}`} destructive onPress={deleteTopic} />
        ) : undefined
      }
    >
      {topic ? (
        <Section>
          <TopicHero topic={topic} />
          <TopicSections topic={topic} />
        </Section>
      ) : null}
      {pending ? <UndoSnackbar message={pending.message} onUndo={undo} onDismiss={leave} /> : null}
    </ToolScreen>
  );
}
