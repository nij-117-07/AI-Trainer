// src/app/language-learner/idioms/index.tsx
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { IdiomLessonView } from "@/features/idioms/components/IdiomLessonView";
import { usePersistedLesson } from "@/features/idioms/hooks/usePersistedDraft";
import { SAVE_FAILED_MESSAGE } from "@/features/idioms/lib/persistence";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";

export default function IdiomsRoute() {
  const router = useRouter();
  const { lesson, saveFailed } = usePersistedLesson();
  const { activeProfile } = useLanguageProfiles();

  return (
    <ToolScreen
      title="Idioms"
      wide
      footerSide={false}
      footer={
        <ActionButton
          label="New idiom"
          icon={Sparkles}
          onPress={() => router.push("/language-learner/idioms/new")}
        />
      }
    >
      <Section>
        <ErrorText message={saveFailed ? SAVE_FAILED_MESSAGE : null} />
        {lesson ? (
          <IdiomLessonView lesson={lesson} nativeLanguage={activeProfile.nativeLanguage} />
        ) : (
          <EmptyHint
            icon={Sparkles}
            title="No idiom yet"
            hint="Your idiom, its meaning, and examples will appear here."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
