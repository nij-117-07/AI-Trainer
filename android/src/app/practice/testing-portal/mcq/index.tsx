// src/app/practice/testing-portal/mcq/index.tsx
import { StyleSheet, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Layers, ListChecks, Sparkles, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ActionButton, pointerCursor } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { McqQuiz } from "@/features/testing-portal/components/McqQuiz";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { useMcqResult } from "@/features/testing-portal/hooks/useMcqResult";

export default function McqRoute() {
  const router = useRouter();
  const mcq = useMcqResult();
  const questions = mcq.result.questions;
  const hasQuestions = questions.length > 0;

  return (
    <ToolScreen
      title={mcq.title || "MCQs"}
      headerRight={
        <View style={styles.headerActions}>
          <HeaderIconButton icon={Layers} label="Sessions" onPress={() => router.push("/practice/testing-portal/mcq/sessions")} />
          {hasQuestions && <ResetButton accessibilityLabel="Clear all questions" onPress={mcq.clear} />}
        </View>
      }
      footer={
        <ActionButton
          label={hasQuestions ? "Generate more questions" : "Generate questions"}
          icon={Sparkles}
          onPress={() => router.push("/practice/testing-portal/mcq/new")}
        />
      }
    >
      <Section>
        {hasQuestions ? (
          <McqQuiz
            key={mcq.quizKey}
            questions={questions}
            contextSetting={mcq.result.contextSetting}
            answers={mcq.answers}
            onSelect={mcq.selectAnswer}
            onRetry={mcq.resetAnswers}
          />
        ) : mcq.loaded ? (
          <EmptyHint
            icon={ListChecks}
            title="No questions yet"
            hint="Tap Generate questions to start."
          />
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
