// src/app/tools/rss/manager/edit.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { SearchX } from "lucide-react-native";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { FeedFormFields, FeedFormFooter } from "@/features/rss/components/manager/FeedForm";
import { useFeedForm } from "@/features/rss/hooks/useFeedForm";
import { useStoredFeed } from "@/features/rss/hooks/useStoredFeed";
import type { RssFeedConfig } from "@/features/rss/types";

export default function RssFeedEditRoute() {
  const { feedId } = useLocalSearchParams<{ feedId: string }>();
  const feed = useStoredFeed(feedId);

  if (feed === undefined) {
    return <ToolScreen title="Edit feed" usesAi={false}>{null}</ToolScreen>;
  }

  if (feed === null) {
    return (
      <ToolScreen title="Edit feed" usesAi={false}>
        <Section>
          <EmptyHint icon={SearchX} title="Feed not found" hint="It may have been deleted. Go back to the Manager." />
        </Section>
      </ToolScreen>
    );
  }

  return <FeedEditPage key={feed.id} feed={feed} />;
}

function FeedEditPage({ feed }: { feed: RssFeedConfig }) {
  const router = useRouter();
  const form = useFeedForm(feed, () => router.back());

  return (
    <ToolScreen title="Edit feed" usesAi={false} footer={<FeedFormFooter form={form} />}>
      <Section>
        <FeedFormFields form={form} />
      </Section>
    </ToolScreen>
  );
}
