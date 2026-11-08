// src/app/tools/flexible-writer/index.tsx
import { FlexibleWriterTool } from "@/features/flexible-writer/components/FlexibleWriterTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function FlexibleWriterRoute() {
  return (
    <ToolScreen title="Flexible Writer">
      <FlexibleWriterTool />
    </ToolScreen>
  );
}
