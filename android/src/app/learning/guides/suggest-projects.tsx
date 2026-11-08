// src/app/learning/guides/suggest-projects.tsx
import { SuggestProjectsTab } from "@/features/guides/components/SuggestProjectsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SuggestProjectsRoute() {
  return (
    <ToolScreen title="Project Suggestions">
      <SuggestProjectsTab />
    </ToolScreen>
  );
}
