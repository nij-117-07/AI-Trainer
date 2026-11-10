// src/app/learning/topic-of-the-day/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  TopicOfTheDayFormFields,
  TopicOfTheDayFormFooter,
  useTopicOfTheDayForm,
} from "@/features/topic-of-the-day/components/TopicOfTheDayForm";

export default function TopicOfTheDayNewRoute() {
  const router = useRouter();
  const topic = useTopicOfTheDayForm(() => router.back());

  return (
    <ToolScreen
      title="New topic"
      headerRight={<ResetButton onPress={topic.reset} />}
      footer={<TopicOfTheDayFormFooter topic={topic} />}
    >
      <TopicOfTheDayFormFields topic={topic} />
    </ToolScreen>
  );
}
