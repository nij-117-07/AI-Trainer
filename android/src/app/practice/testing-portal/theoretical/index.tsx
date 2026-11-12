// src/app/practice/testing-portal/theoretical/index.tsx
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Layers, Sparkles, Trash2, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ActionButton, pointerCursor } from "@/components/tool/FormControls";
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
    Alert.alert("Clear all questions?", "The questions, answers, grades, and model answers in this session will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: theoretical.clear },
    ]);
  }

  return (
    <ToolScreen
      title={theoretical.title || "Theoretical"}
      headerRight={
        <View style={styles.headerActions}>
          <HeaderIconButton icon={Layers} label="Sessions" onPress={() => router.push("/practice/testing-portal/theoretical/sessions")} />
          {hasQuestions && <HeaderIconButton icon={Trash2} label="Clear all questions" onPress={confirmClear} />}
        </View>
      }
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

function HeaderIconButton({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        pointerCursor,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <Icon size={20} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
