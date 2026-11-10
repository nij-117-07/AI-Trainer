// src/app/language-learner/lesson/index.tsx
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { LessonResultView } from "@/features/lesson/components/LessonResultView";
import { usePersistedLesson } from "@/features/lesson/hooks/usePersistedDraft";

export default function LessonRoute() {
  const router = useRouter();
  const lesson = usePersistedLesson();

  return (
    <ToolScreen
      title="Language Lesson"
      footer={
        <ActionButton label="New lesson" icon={Sparkles} onPress={() => router.push("/language-learner/lesson/new")} />
      }
    >
      <Section>
        {lesson ? (
          <LessonResultView lesson={lesson} />
        ) : (
          <EmptyHint
            icon={Sparkles}
            title="No lesson yet"
            hint="Tap New lesson below, choose your level and focus, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
