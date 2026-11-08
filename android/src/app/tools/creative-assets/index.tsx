// src/app/tools/creative-assets/index.tsx
import { CreativeAssetsTab } from "@/features/creative-assets/components/CreativeAssetsTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function CreativeAssetsRoute() {
  return (
    <ToolScreen title="Creative Assets">
      <CreativeAssetsTab />
    </ToolScreen>
  );
}
