// src/app/tools/rss/manager/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { FeedFormFields, FeedFormFooter } from "@/features/rss/components/manager/FeedForm";
import { useFeedForm } from "@/features/rss/hooks/useFeedForm";

export default function RssFeedNewRoute() {
  const router = useRouter();
  const form = useFeedForm(null, () => router.back());

  return (
    <ToolScreen
      title="Add feed"
      usesAi={false}
      headerRight={<ResetButton onPress={form.reset} />}
      footer={<FeedFormFooter form={form} />}
    >
      <Section>
        <FeedFormFields form={form} />
      </Section>
    </ToolScreen>
  );
}
