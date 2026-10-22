import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ConceptualBridgePage } from "@/features/learning/conceptual-bridge/components/pages/ConceptualBridgePage";

export const metadata: Metadata = {
  title: "Conceptual Bridge | Learning",
  description: "Connect unfamiliar ideas to things you already know and train your cognitive flexibility.",
};

export default function ConceptualBridgeRoutePage() {
  return (
    <>
      <SetPageTitle title="Conceptual Bridge" />
      <ConceptualBridgePage />
    </>
  );
}
