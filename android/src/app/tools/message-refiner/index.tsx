// src/app/tools/message-refiner/index.tsx
import { MessageRefinerTool } from "@/features/message-refiner/components/MessageRefinerTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function MessageRefinerRoute() {
  return (
    <ToolScreen title="Message Refiner">
      <MessageRefinerTool />
    </ToolScreen>
  );
}
