// src/app/tools/voice-notes/index.tsx
import { VoiceNotesTool } from "@/features/voice-notes/components/VoiceNotesTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function VoiceNotesRoute() {
  return (
    <ToolScreen title="Voice Notes">
      <VoiceNotesTool />
    </ToolScreen>
  );
}
