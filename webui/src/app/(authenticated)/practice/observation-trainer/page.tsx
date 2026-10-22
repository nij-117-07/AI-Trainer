import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ObservationTrainerPage } from "@/features/practice/observation-trainer/components/pages/ObservationTrainerPage";

export const metadata: Metadata = {
  title: "Observation Trainer | Practice",
  description: "Sharpen your attention to detail by spotting differences an expert would never miss.",
};

export default function ObservationTrainerRoutePage() {
  return (
    <>
      <SetPageTitle title="Observation Trainer" />
      <ObservationTrainerPage />
    </>
  );
}
