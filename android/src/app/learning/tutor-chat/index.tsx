// src/app/learning/tutor-chat/index.tsx
import { TutorChatView } from "@/features/tutor-chat/components/TutorChatView";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function TutorChatRoute() {
  return (
    <ToolScreen title="Tutor Chat">
      <TutorChatView />
    </ToolScreen>
  );
}
