// src/app/learning/subtopic-lister/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SubtopicFooter, SubtopicListerTab } from "@/features/subtopic-lister/components/SubtopicListerTab";
import { useSubtopicLister } from "@/features/subtopic-lister/hooks/useSubtopicLister";

export default function SubtopicListerRoute() {
  const lister = useSubtopicLister();

  return (
    <ToolScreen
      title="Subtopic Lister"
      headerRight={<ResetButton onPress={lister.reset} />}
      footer={<SubtopicFooter lister={lister} />}
    >
      <SubtopicListerTab lister={lister} />
    </ToolScreen>
  );
}
