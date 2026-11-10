// src/app/language-learner/roleplay/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RoleplayChatBody, RoleplayChatFooter } from "@/features/roleplay/components/RoleplayChatView";
import { useRoleplayChat } from "@/features/roleplay/hooks/useRoleplayChat";

export default function RoleplayChatRoute() {
  const chat = useRoleplayChat();

  return (
    <ToolScreen
      title="Roleplay Chat"
      headerRight={<ResetButton label="Reset chat" onPress={chat.newConversation} />}
      footer={chat.loaded ? <RoleplayChatFooter chat={chat} /> : undefined}
    >
      <RoleplayChatBody chat={chat} />
    </ToolScreen>
  );
}
