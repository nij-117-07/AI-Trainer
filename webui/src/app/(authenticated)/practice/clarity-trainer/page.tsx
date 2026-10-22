import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ClarityTrainerPage } from "@/features/practice/clarity-trainer/components/pages/ClarityTrainerPage";

export const metadata: Metadata = {
  title: "Clarity Trainer | Practice",
  description: "Practice writing ultra-precise, ambiguity-free instructions and get them scored.",
};

export default function ClarityTrainerRoutePage() {
  return (
    <>
      <SetPageTitle title="Clarity Trainer" />
      <ClarityTrainerPage />
    </>
  );
}
