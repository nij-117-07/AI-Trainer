// src/app/learning/subtopic-lister/index.tsx
import { SubtopicListerTab } from "@/features/subtopic-lister/components/SubtopicListerTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function SubtopicListerRoute() {
  return (
    <ToolScreen title="Subtopic Lister">
      <SubtopicListerTab />
    </ToolScreen>
  );
}
