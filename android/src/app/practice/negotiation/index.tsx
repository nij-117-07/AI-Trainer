// src/app/practice/negotiation/index.tsx
import { NegotiationTool } from "@/features/negotiation/components/NegotiationTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function NegotiationRoute() {
  return (
    <ToolScreen title="Negotiation Practice">
      <NegotiationTool />
    </ToolScreen>
  );
}
