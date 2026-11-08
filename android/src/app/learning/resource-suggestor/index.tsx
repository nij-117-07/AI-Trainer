// src/app/learning/resource-suggestor/index.tsx
import { ResourceSuggestorTab } from "@/features/resource-suggestor/components/ResourceSuggestorTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ResourceSuggestorRoute() {
  return (
    <ToolScreen title="Resource Suggestor">
      <ResourceSuggestorTab />
    </ToolScreen>
  );
}
