// src/app/language-learner/roleplay/index.tsx
import { RoleplayChatView } from "@/features/roleplay/components/RoleplayChatView";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RoleplayChatRoute() {
  return (
    <ToolScreen title="Roleplay Chat">
      <RoleplayChatView />
    </ToolScreen>
  );
}
