// src/app/tools/vision/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  VisionConverterFooter,
  VisionConverterForm,
  VisionConverterResults,
  useVisionConverter,
} from "@/features/vision-converter/components/VisionConverterScreen";

export default function VisionConverterRoute() {
  const vision = useVisionConverter();

  return (
    <ToolScreen
      title="Vision Converter"
      headerRight={<ResetButton onPress={vision.reset} />}
      footerSide={false}
      footer={<VisionConverterFooter vision={vision} />}
    >
      <VisionConverterForm vision={vision} />
      <VisionConverterResults vision={vision} />
    </ToolScreen>
  );
}
