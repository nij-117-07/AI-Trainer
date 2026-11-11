// src/app/learning/conceptual-bridge/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  ConceptualBridgeFooter,
  ConceptualBridgeForm,
  ConceptualBridgeResults,
  useConceptualBridge,
} from "@/features/conceptual-bridge/components/ConceptualBridgeTab";

export default function ConceptualBridgeRoute() {
  const bridge = useConceptualBridge();

  return (
    <ToolScreen
      title="Conceptual Bridge"
      headerRight={<ResetButton onPress={bridge.reset} accessibilityLabel="Reset bridge" />}
      footer={<ConceptualBridgeFooter bridge={bridge} />}
    >
      {bridge.result ? <ConceptualBridgeResults bridge={bridge} /> : <ConceptualBridgeForm bridge={bridge} />}
    </ToolScreen>
  );
}
