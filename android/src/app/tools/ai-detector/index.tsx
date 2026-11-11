// src/app/tools/ai-detector/index.tsx
/** AI Detector route: scores a text for AI likelihood and lists the patterns behind the score. */
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { AiDetectorFooter, AiDetectorForm, AiDetectorResults } from "@/features/ai-detector/components/AiDetectorTool";
import { useAiDetector } from "@/features/ai-detector/hooks/useAiDetector";

export default function AiDetectorRoute() {
  const detector = useAiDetector();

  return (
    <ToolScreen
      title="AI Detector"
      headerRight={<ResetButton onPress={detector.reset} />}
      footerSide={false}
      footer={<AiDetectorFooter detector={detector} />}
    >
      {detector.loaded && (
        <>
          <AiDetectorForm detector={detector} />
          <AiDetectorResults detector={detector} />
        </>
      )}
    </ToolScreen>
  );
}
