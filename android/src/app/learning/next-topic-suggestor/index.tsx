// src/app/learning/next-topic-suggestor/index.tsx
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Pencil } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  NextTopicForm,
  NextTopicFormFooter,
  NextTopicResultFooter,
  NextTopicResults,
} from "@/features/next-topic-suggestor/components/NextTopicSuggestorTab";
import { useNextTopicSuggestor } from "@/features/next-topic-suggestor/hooks/useNextTopicSuggestor";
import type { NextTopicResult } from "@/features/next-topic-suggestor/types";

const NO_TOPICS = "No topic recommendations returned. Try again.";

export default function NextTopicSuggestorRoute() {
  const suggestor = useNextTopicSuggestor();
  const { result, toggleKept } = suggestor;
  const [editFrom, setEditFrom] = useState<NextTopicResult | null>(null);
  const topics = result?.recommendations ?? [];
  const editing = editFrom === result;
  const showResult = topics.length > 0 && !editing;
  const notice = result && topics.length === 0 ? NO_TOPICS : null;

  return (
    <ToolScreen
      title="Next Topic Suggestor"
      headerRight={
        <View style={styles.headerActions}>
          {showResult ? <EditFormButton onPress={() => setEditFrom(result)} /> : null}
          <ResetButton onPress={suggestor.reset} accessibilityLabel="Reset form and results" />
        </View>
      }
      footer={
        showResult ? (
          <NextTopicResultFooter error={suggestor.error} pending={suggestor.pending} onFindMore={suggestor.suggest} />
        ) : (
          <NextTopicFormFooter suggestor={suggestor} notice={notice} />
        )
      }
    >
      {showResult ? <NextTopicResults topics={topics} onToggle={toggleKept} /> : <NextTopicForm suggestor={suggestor} />}
    </ToolScreen>
  );
}

function EditFormButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit form"
      style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Pencil size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
