// src/app/learning/explainer/curriculum.tsx
import { CurriculumTab } from "@/features/explainer/components/CurriculumTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function CurriculumRoute() {
  return (
    <ToolScreen title="Curriculum Path">
      <CurriculumTab />
    </ToolScreen>
  );
}
