// src/app/learning/roleplay-chatbot/index.tsx
import { RoleplayChatTab } from "@/features/roleplay-chatbot/components/RoleplayChatTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RoleplayChatbotRoute() {
  return (
    <ToolScreen title="Roleplay Chatbot">
      <RoleplayChatTab />
    </ToolScreen>
  );
}
