// src/app/learning/topic-of-the-day/[id]/new.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Layers } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  TopicOfTheDayFormFields,
  TopicOfTheDayFormFooter,
  useTopicOfTheDayForm,
} from "@/features/topic-of-the-day/components/TopicOfTheDayForm";
import { useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { findBroadTopic } from "@/features/topic-of-the-day/lib/library";

export default function NewTopicRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { library, loaded } = useTopicLibrary();
  const broad = findBroadTopic(library, id);
  const topic = useTopicOfTheDayForm(broad, () => router.back());

  if (loaded && !broad) {
    return (
      <ToolScreen title="New topic">
        <EmptyHint icon={Layers} title="Broader topic not found" hint="Go back and choose a broader topic." />
      </ToolScreen>
    );
  }

  return (
    <ToolScreen
      title="New topic"
      headerRight={<ResetButton onPress={topic.reset} />}
      footer={<TopicOfTheDayFormFooter topic={topic} />}
    >
      <TopicOfTheDayFormFields topic={topic} broad={broad} />
    </ToolScreen>
  );
}
