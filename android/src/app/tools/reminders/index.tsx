// src/app/tools/reminders/index.tsx
import { RemindersTool } from "@/features/reminders/components/RemindersTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RemindersRoute() {
  return (
    <ToolScreen title="Reminders">
      <RemindersTool />
    </ToolScreen>
  );
}
