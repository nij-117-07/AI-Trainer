// src/app/learning/skill-architect/[id].tsx
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useLayout } from "@/theme";
import { SkillTreeDetail } from "@/features/skill-architect/components/SkillTreeDetail";
import { SkillTreeEditFooter } from "@/features/skill-architect/components/SkillTreeEditFooter";
import { SkillTreeHeaderActions } from "@/features/skill-architect/components/SkillTreeHeaderActions";
import { SkillTreeUpdateFooter } from "@/features/skill-architect/components/SkillTreeUpdateFooter";
import { useSkillTree } from "@/features/skill-architect/hooks/useSkillTree";
import { findSkill, parseSkillRef, type SkillRef } from "@/features/skill-architect/lib/selection";

export default function SkillArchitectDetailRoute() {
  const params = useLocalSearchParams<{ id: string; level?: string; skill?: string }>();
  const id = String(params.id ?? "");
  const router = useRouter();
  const { size } = useLayout();
  const state = useSkillTree(id);
  const selected = parseSkillRef({ level: params.level, skill: params.skill });
  const picked = state.tree ? findSkill(state.tree.response.skillTreeLevels, selected) : null;
  const skillPage = size === "phone" && picked !== null && !state.editing;

  function openSkill(ref: SkillRef) {
    if (size === "phone") {
      router.push(`/learning/skill-architect/${id}?level=${ref.level}&skill=${ref.skill}` as never);
    } else {
      router.setParams({ level: String(ref.level), skill: String(ref.skill) });
    }
  }

  async function deleteTree() {
    if (await state.remove()) router.replace("/learning/skill-architect" as never);
  }

  function confirmDelete() {
    Alert.alert(
      "Delete this skill tree?",
      `"${state.tree?.topic ?? ""}" and its generated skill levels will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void deleteTree() },
      ],
    );
  }

  const footer = !state.tree ? undefined : state.editing ? (
    <SkillTreeEditFooter state={state} />
  ) : skillPage ? undefined : (
    <SkillTreeUpdateFooter state={state} />
  );

  return (
    <ToolScreen
      title={state.tree?.topic ?? "Skill tree"}
      wide
      footerSide={false}
      headerRight={<SkillTreeHeaderActions state={state} onDelete={confirmDelete} />}
      footer={footer}
    >
      <SkillTreeDetail state={state} selected={selected} skillPage={skillPage} onSelect={openSkill} />
    </ToolScreen>
  );
}
