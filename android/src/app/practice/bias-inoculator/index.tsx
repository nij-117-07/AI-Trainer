// src/app/practice/bias-inoculator/index.tsx
import { BiasInoculatorTab } from "@/features/bias-inoculator/components/BiasInoculatorTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function BiasInoculatorRoute() {
  return (
    <ToolScreen title="Cognitive Bias Inoculator">
      <BiasInoculatorTab />
    </ToolScreen>
  );
}
