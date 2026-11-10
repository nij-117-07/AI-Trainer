// src/app/learning/topic-of-the-day/index.tsx
import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TopicOfTheDayView } from "@/features/topic-of-the-day/components/TopicOfTheDayView";
import { usePersistedTopic } from "@/features/topic-of-the-day/hooks/usePersistedDraft";

export default function TopicOfTheDayRoute() {
  const router = useRouter();
  const topic = usePersistedTopic();

  return (
    <ToolScreen
      title="Topic of the Day"
      footer={
        <ActionButton label="New topic" icon={CalendarDays} onPress={() => router.push("/learning/topic-of-the-day/new")} />
      }
    >
      <Section>
        {topic ? (
          <TopicOfTheDayView topic={topic} />
        ) : (
          <EmptyHint
            icon={CalendarDays}
            title="No topic yet"
            hint="Tap New topic below, enter a subject and level, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}
