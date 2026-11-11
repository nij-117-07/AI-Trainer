// src/app/learning/topic-of-the-day/index.tsx
import { ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Layers, Plus } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { BroadTopicRow } from "@/features/topic-of-the-day/components/BroadTopicRow";
import { showSaveError, useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { deleteBroadTopic, topicsFor } from "@/features/topic-of-the-day/lib/library";
import type { BroadTopic } from "@/features/topic-of-the-day/types";

export default function TopicOfTheDayRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { library, loaded, change } = useTopicLibrary();

  function confirmDelete(broad: BroadTopic) {
    const count = topicsFor(library, broad.id).length;
    const topicCount = count === 1 ? "1 topic" : `${count} topics`;
    Alert.alert("Delete this broader topic?", `"${broad.name}" and its ${topicCount} will be removed. This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void change((current) => deleteBroadTopic(current, broad.id)).catch(showSaveError),
      },
    ]);
  }

  return (
    <ToolScreen
      title="Topic of the Day"
      wide
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
            hint="Tap Add broader topic to start, for example Biology or Machine learning."
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
                onDelete={() => confirmDelete(broad)}
              />
            ))}
          </CardGrid>
        )}
      </Section>
    </ToolScreen>
  );
}
