// src/app/language-learner/translator/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { TranslatorTool } from "@/features/translator/components/TranslatorTool";

export default function TranslatorRoute() {
  return (
    <ToolScreen title="Translator">
      <TranslatorTool />
    </ToolScreen>
  );
}
