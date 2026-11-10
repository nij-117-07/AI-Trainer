// src/app/learning/skill-architect/[id].tsx
import { useLocalSearchParams } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeDetail } from "@/features/skill-architect/components/SkillTreeDetail";
import { SkillTreeUpdateFooter } from "@/features/skill-architect/components/SkillTreeUpdateFooter";
import { useSkillTree } from "@/features/skill-architect/hooks/useSkillTree";

export default function SkillArchitectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useSkillTree(String(id ?? ""));
  const showUpdate = state.tree !== undefined && !state.editing;

  return (
    <ToolScreen title="Skill Tree" footer={showUpdate ? <SkillTreeUpdateFooter state={state} /> : undefined}>
      <SkillTreeDetail state={state} />
    </ToolScreen>
  );
}
