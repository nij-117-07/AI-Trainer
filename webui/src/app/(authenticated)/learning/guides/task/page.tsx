import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { GuideTaskPage } from "@/features/learning/guides/components/pages/GuideTaskPage";

export const metadata: Metadata = {
  title: "Guide Tasks | Learning",
  description: "Get mentor feedback and actionable tasks to level up.",
};

export default function GuideTaskRoutePage() {
  return (
    <>
      <SetPageTitle title="Guide Tasks" />
      <GuideTaskPage />
    </>
  );
}
