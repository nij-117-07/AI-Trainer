// src/app/learning/skill-architect/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeDetail } from "@/features/skill-architect/components/SkillTreeDetail";

export default function SkillArchitectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ToolScreen title="Skill Tree">
      <SkillTreeDetail treeId={String(id ?? "")} />
    </ToolScreen>
  );
}
