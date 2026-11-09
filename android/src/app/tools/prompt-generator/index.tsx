// src/app/tools/prompt-generator/index.tsx
import { PromptToolsHub } from "@/features/prompt-generator/components/PromptToolsHub";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function PromptGeneratorRoute() {
  return (
    <ToolScreen title="Prompt Generator">
      <PromptToolsHub />
    </ToolScreen>
  );
}
