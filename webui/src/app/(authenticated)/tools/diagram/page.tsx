import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { DiagramPage } from "@/features/tools/diagram/components/pages/DiagramPage";

export const metadata: Metadata = {
  title: "Diagram Generator | Tools",
  description: "Generate or refine Mermaid and Draw.io diagram code from natural language.",
};

export default function DiagramRoutePage() {
  return (
    <>
      <SetPageTitle title="Diagram Generator" />
      <DiagramPage />
    </>
  );
}
