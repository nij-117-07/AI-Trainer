// src/app/learning/skill-architect/index.tsx
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SkillTreeList } from "@/features/skill-architect/components/SkillTreeList";

export default function SkillArchitectRoute() {
  const router = useRouter();

  return (
    <ToolScreen
      title="Skill Architect"
      wide
      footerSide={false}
      footer={
        <ActionButton
          label="Create skill tree"
          icon={Plus}
          onPress={() => router.push("/learning/skill-architect/new" as never)}
        />
      }
    >
      <SkillTreeList />
    </ToolScreen>
  );
}
