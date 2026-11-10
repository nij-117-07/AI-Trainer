// src/app/practice/testing-portal/theoretical/index.tsx
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
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
      headerRight={hasQuestions ? <ResetButton label="Clear all" onPress={confirmClear} /> : undefined}
      footer={
        <ActionButton
          label={hasQuestions ? "Generate more" : "Generate questions"}
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
          />
        ) : (
          theoretical.loaded && (
            <EmptyHint
              icon={BookOpen}
              title="No questions yet"
              hint="Tap Generate questions below, choose a topic and context, then generate."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
