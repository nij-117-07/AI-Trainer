import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ForesightTrainerPage } from "@/features/practice/foresight-trainer/components/pages/ForesightTrainerPage";

export const metadata: Metadata = {
  title: "Foresight Trainer | Practice",
  description: "Make consequential decisions in immersive multi-scene scenarios and grow your strategic thinking.",
};

export default function ForesightTrainerRoutePage() {
  return (
    <>
      <SetPageTitle title="Foresight Trainer" />
      <ForesightTrainerPage />
    </>
  );
}
