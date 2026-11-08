// src/app/tools/vision/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { VisionConverterScreen } from "@/features/vision-converter/components/VisionConverterScreen";

export default function VisionConverterRoute() {
  return (
    <ToolScreen title="Vision Converter">
      <VisionConverterScreen />
    </ToolScreen>
  );
}
