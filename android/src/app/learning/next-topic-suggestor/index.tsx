// src/app/learning/next-topic-suggestor/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NextTopicFooter, NextTopicResults } from "@/features/next-topic-suggestor/components/NextTopicSuggestorTab";
import { useNextTopicSuggestor } from "@/features/next-topic-suggestor/hooks/useNextTopicSuggestor";

export default function NextTopicSuggestorRoute() {
  const suggestor = useNextTopicSuggestor();

  return (
    <ToolScreen
      title="Next Topic Suggestor"
      headerRight={<ResetButton onPress={suggestor.reset} />}
      footer={<NextTopicFooter suggestor={suggestor} />}
    >
      <NextTopicResults suggestor={suggestor} />
    </ToolScreen>
  );
}
