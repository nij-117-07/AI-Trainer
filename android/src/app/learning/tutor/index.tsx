// src/app/learning/tutor/index.tsx
import { TutorTab } from "@/features/tutor/components/TutorTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function TutorRoute() {
  return (
    <ToolScreen title="Adaptive Tutor">
      <TutorTab />
    </ToolScreen>
  );
}
