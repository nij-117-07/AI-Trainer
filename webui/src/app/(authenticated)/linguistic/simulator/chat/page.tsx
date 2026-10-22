import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SimulatorChatPage } from "@/features/linguistic/simulator/components/pages/SimulatorChatPage";

export const metadata: Metadata = {
  title: "Simulator Chat | Linguistic",
  description: "Hold a running, in-character conversation with a simulated persona.",
};

export default function SimulatorChatRoutePage() {
  return (
    <>
      <SetPageTitle title="Simulator Chat" />
      <SimulatorChatPage />
    </>
  );
}
