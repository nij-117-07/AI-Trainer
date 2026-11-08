// src/app/learning/explainer/curriculum.tsx
import { CurriculumTab } from "@/features/explainer/components/CurriculumTab";
import { ToolScreen } from "@/features/testing-portal/components/ToolScreen";

export default function CurriculumRoute() {
  return (
    <ToolScreen title="Curriculum Path">
      <CurriculumTab />
    </ToolScreen>
  );
}
