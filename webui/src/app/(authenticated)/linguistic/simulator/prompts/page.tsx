import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SimulatorPromptsPage } from "@/features/linguistic/simulator/components/pages/SimulatorPromptsPage";

export const metadata: Metadata = {
  title: "Simulator Prompts | Linguistic",
  description: "Manage the persona system prompts stored by the Simulator service.",
};

export default function SimulatorPromptsRoutePage() {
  return (
    <>
      <SetPageTitle title="Simulator Prompts" />
      <SimulatorPromptsPage />
    </>
  );
}
