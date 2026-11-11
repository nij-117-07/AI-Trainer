// src/app/language-learner/lesson/index.tsx
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { LessonResultView } from "@/features/lesson/components/LessonResultView";
import { usePersistedLesson } from "@/features/lesson/hooks/usePersistedDraft";
import { SAVE_FAILED_MESSAGE } from "@/features/lesson/lib/persistence";

export default function LessonRoute() {
  const router = useRouter();
  const { lesson, saveFailed } = usePersistedLesson();

  return (
    <ToolScreen
      title="Language Lesson"
      footer={
        <ActionButton label="New lesson" icon={Sparkles} onPress={() => router.push("/language-learner/lesson/new")} />
      }
      footerSide={false}
    >
      <Section>
        <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
        {lesson ? (
          <LessonResultView lesson={lesson} />
        ) : (
          <EmptyHint
            icon={Sparkles}
            title="No lesson yet"
            hint="Pick a level and focus to create one."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
