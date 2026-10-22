import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { DailyPlanPage } from "@/features/learning/guides/components/pages/DailyPlanPage";

export const metadata: Metadata = {
  title: "Daily Study Plan | Learning",
  description: "Generate a detailed daily study plan with a structured roadmap and gap analysis.",
};

export default function DailyPlanRoutePage() {
  return (
    <>
      <SetPageTitle title="Daily Study Plan" />
      <DailyPlanPage />
    </>
  );
}
