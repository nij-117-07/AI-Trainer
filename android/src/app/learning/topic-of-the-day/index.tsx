// src/app/learning/topic-of-the-day/index.tsx
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Layers, Plus } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { BroadTopicRow } from "@/features/topic-of-the-day/components/BroadTopicRow";
import { useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteBroadTopic, topicsFor } from "@/features/topic-of-the-day/lib/library";
import type { BroadTopic } from "@/features/topic-of-the-day/types";

export default function TopicOfTheDayRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { library, loaded, pending, removeLater, undo, dismiss } = useTopicLibrary();

  function deleteBroad(broad: BroadTopic) {
    removeLater({
      message: `Deleted broader topic ${broad.name}`,
      apply: (current) => deleteBroadTopic(current, broad.id),
    });
  }

  return (
    <ToolScreen
      title="Topic of the Day"
      wide
      usesAi={false}
      footer={
        <ActionButton
          label="Add broader topic"
          icon={Plus}
          onPress={() => router.push("/learning/topic-of-the-day/broad-form")}
        />
      }
    >
      <Section>
        {!loaded ? (
          <ActivityIndicator color={colors.primary} />
        ) : library.broadTopics.length === 0 ? (
          <EmptyHint
            icon={Layers}
            title="No broader topics yet"
            hint="Add a broad area you study, such as Biology."
          />
        ) : (
          <CardGrid>
            {library.broadTopics.map((broad) => (
              <BroadTopicRow
                key={broad.id}
                broad={broad}
                count={topicsFor(library, broad.id).length}
                onOpen={() => router.push(`/learning/topic-of-the-day/${broad.id}`)}
                onEdit={() => router.push({ pathname: "/learning/topic-of-the-day/broad-form", params: { id: broad.id } })}
                onDelete={() => deleteBroad(broad)}
              />
            ))}
          </CardGrid>
        )}

        {pending ? <UndoSnackbar message={pending.message} onUndo={undo} onDismiss={dismiss} /> : null}
      </Section>
    </ToolScreen>
  );
}
