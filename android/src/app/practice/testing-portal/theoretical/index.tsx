// src/app/practice/testing-portal/theoretical/index.tsx
import { Alert, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Sparkles, Trash2 } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { TheoreticalResultView } from "@/features/testing-portal/components/TheoreticalResultView";
import { useTheoreticalResult } from "@/features/testing-portal/hooks/useTheoreticalResult";

export default function TheoreticalRoute() {
  const router = useRouter();
  const theoretical = useTheoreticalResult();
  const questions = theoretical.result.questions;
  const hasQuestions = questions.length > 0;

  function confirmClear() {
    Alert.alert("Clear all questions?", "Your answers, grades, and model answers will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: theoretical.clear },
    ]);
  }

  return (
    <ToolScreen
      title="Theoretical"
      headerRight={hasQuestions ? <ClearAllButton onPress={confirmClear} /> : undefined}
      footer={
        <ActionButton
          label={hasQuestions ? "Generate more questions" : "Generate questions"}
          icon={Sparkles}
          onPress={() => router.push("/practice/testing-portal/theoretical/new")}
        />
      }
    >
      <Section>
        {hasQuestions ? (
          <TheoreticalResultView
            key={theoretical.quizKey}
            questions={questions}
            contextSetting={theoretical.result.contextSetting}
            difficultyLevel={theoretical.result.difficultyLevel}
            answers={theoretical.answers}
            failedIndex={theoretical.failedIndex}
            onAnswerChange={theoretical.updateAnswer}
          />
        ) : theoretical.loaded ? (
          <EmptyHint icon={BookOpen} title="No questions yet" hint="Generate a set to start writing answers." />
        ) : (
          <PortalLoading />
        )}
      </Section>
    </ToolScreen>
  );
}

function ClearAllButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Clear all questions"
      style={({ pressed }) => [
        styles.clearButton,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Trash2 size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
