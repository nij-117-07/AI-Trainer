// src/app/learning/guides/suggest-topics.tsx
import { SuggestTopicsTab } from "@/features/guides/components/SuggestTopicsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SuggestTopicsRoute() {
  return (
    <ToolScreen title="Topic Suggestions">
      <SuggestTopicsTab />
    </ToolScreen>
  );
}
