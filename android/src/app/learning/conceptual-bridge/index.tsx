// src/app/learning/conceptual-bridge/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  ConceptualBridgeFooter,
  ConceptualBridgeResults,
  useConceptualBridge,
} from "@/features/conceptual-bridge/components/ConceptualBridgeTab";

export default function ConceptualBridgeRoute() {
  const bridge = useConceptualBridge();

  return (
    <ToolScreen
      title="Conceptual Bridge"
      headerRight={<ResetButton onPress={bridge.reset} />}
      footer={<ConceptualBridgeFooter bridge={bridge} />}
    >
      <ConceptualBridgeResults bridge={bridge} />
    </ToolScreen>
  );
}
