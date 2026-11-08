// src/app/language-learner/simulator/chat.tsx
import { SimulatorChatTab } from "@/features/simulator/components/SimulatorChatTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SimulatorChatRoute() {
  return (
    <ToolScreen title="Simulator Chat">
      <SimulatorChatTab />
    </ToolScreen>
  );
}
