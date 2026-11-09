// src/app/tools/text-to-speech/index.tsx
import { TextToSpeechTool } from "@/features/text-to-speech/components/TextToSpeechTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function TextToSpeechRoute() {
  return (
    <ToolScreen title="Text to Speech">
      <TextToSpeechTool />
    </ToolScreen>
  );
}
