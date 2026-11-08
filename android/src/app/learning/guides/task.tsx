// src/app/learning/guides/task.tsx
import { GuideTaskTab } from "@/features/guides/components/GuideTaskTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function GuideTaskRoute() {
  return (
    <ToolScreen title="Guide Tasks">
      <GuideTaskTab />
    </ToolScreen>
  );
}
