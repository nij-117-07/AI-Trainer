// src/app/practice/testing-portal/mcq/index.tsx
import { useRouter } from "expo-router";
import { ListChecks, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { McqQuiz } from "@/features/testing-portal/components/McqQuiz";
import { useMcqResult } from "@/features/testing-portal/hooks/useMcqResult";

export default function McqRoute() {
  const router = useRouter();
  const mcq = useMcqResult();
  const questions = mcq.result.questions;
  const hasQuestions = questions.length > 0;

  return (
    <ToolScreen
      title="MCQs"
      headerRight={hasQuestions ? <ResetButton label="Clear all" onPress={mcq.clear} /> : undefined}
      footer={
        <ActionButton
          label={hasQuestions ? "Generate more" : "Generate MCQs"}
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
          />
        ) : (
          mcq.loaded && (
            <EmptyHint
              icon={ListChecks}
              title="No questions yet"
              hint="Tap Generate MCQs below, choose a topic and context, then generate."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
