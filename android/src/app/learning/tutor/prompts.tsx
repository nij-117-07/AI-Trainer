// src/app/learning/tutor/prompts.tsx
import { PromptManagerTab } from "@/features/tutor/components/PromptManagerTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function PromptsRoute() {
  return (
    <ToolScreen title="Prompt Templates">
      <PromptManagerTab />
    </ToolScreen>
  );
}
