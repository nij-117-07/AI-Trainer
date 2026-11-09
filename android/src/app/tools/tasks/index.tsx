// src/app/tools/tasks/index.tsx
import { TasksTool } from "@/features/tasks/components/TasksTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function TasksRoute() {
  return (
    <ToolScreen title="Task Manager">
      <TasksTool />
    </ToolScreen>
  );
}
