// src/app/learning/resource-suggestor/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ResourceSuggestorFooter, ResourceSuggestorResults } from "@/features/resource-suggestor/components/ResourceSuggestorTab";
import { useResourceSuggestor } from "@/features/resource-suggestor/hooks/useResourceSuggestor";

export default function ResourceSuggestorRoute() {
  const suggestor = useResourceSuggestor();

  return (
    <ToolScreen
      title="Resource Suggestor"
      headerRight={<ResetButton onPress={suggestor.reset} />}
      footer={<ResourceSuggestorFooter suggestor={suggestor} />}
    >
      <ResourceSuggestorResults suggestor={suggestor} />
    </ToolScreen>
  );
}
