// src/app/learning/skill-architect/new.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeCreate } from "@/features/skill-architect/components/SkillTreeCreate";

export default function SkillArchitectNewRoute() {
  return (
    <ToolScreen title="Create a new skill tree">
      <SkillTreeCreate />
    </ToolScreen>
  );
}
