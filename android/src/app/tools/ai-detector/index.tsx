// src/app/tools/ai-detector/index.tsx
import { AiDetectorWizard } from "@/features/ai-detector/components/AiDetectorWizard";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function AiDetectorRoute() {
  return (
    <ToolScreen title="AI Detector">
      <AiDetectorWizard />
    </ToolScreen>
  );
}
