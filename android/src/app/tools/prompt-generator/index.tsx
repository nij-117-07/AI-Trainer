// src/app/tools/prompt-generator/index.tsx
import { PromptGeneratorTool } from "@/features/prompt-generator/components/PromptGeneratorTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function PromptGeneratorRoute() {
  return (
    <ToolScreen title="Prompt Generator">
      <PromptGeneratorTool />
    </ToolScreen>
  );
}
