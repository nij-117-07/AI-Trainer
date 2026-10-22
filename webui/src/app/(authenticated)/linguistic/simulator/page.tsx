import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SimulatorRunPage } from "@/features/linguistic/simulator/components/pages/SimulatorRunPage";

export const metadata: Metadata = {
  title: "Simulator Run | Linguistic",
  description: "Drop a persona into a scenario and deliver your line for a behavioral simulation.",
};

export default function SimulatorRoutePage() {
  return (
    <>
      <SetPageTitle title="Simulator Run" />
      <SimulatorRunPage />
    </>
  );
}
