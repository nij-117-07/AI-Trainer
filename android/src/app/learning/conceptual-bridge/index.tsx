// src/app/learning/conceptual-bridge/index.tsx
import { ConceptualBridgeTab } from "@/features/conceptual-bridge/components/ConceptualBridgeTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ConceptualBridgeRoute() {
  return (
    <ToolScreen title="Conceptual Bridge">
      <ConceptualBridgeTab />
    </ToolScreen>
  );
}
