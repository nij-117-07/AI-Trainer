import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { BattlegroundPage } from "@/features/practice/battleground/components/pages/BattlegroundPage";

export const metadata: Metadata = {
  title: "Battleground Simulator | Practice",
  description: "Enter an adaptive tactical scenario and face an adversary that learns your patterns.",
};

export default function BattlegroundRoutePage() {
  return (
    <>
      <SetPageTitle title="Battleground Simulator" />
      <BattlegroundPage />
    </>
  );
}
