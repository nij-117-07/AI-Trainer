// src/app/learning/skill-architect/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeList } from "@/features/skill-architect/components/SkillTreeList";

export default function SkillArchitectRoute() {
  return (
    <ToolScreen title="Skill Architect">
      <SkillTreeList />
    </ToolScreen>
  );
}
