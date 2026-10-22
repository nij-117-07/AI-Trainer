import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { TutorPage } from "@/features/learning/tutor/components/pages/TutorPage";

export const metadata: Metadata = {
  title: "Adaptive Tutor | Learning",
  description: "Get a personalized explanation adapted to your level, learning style, and scenario.",
};

export default function TutorRoutePage() {
  return (
    <>
      <SetPageTitle title="Adaptive Tutor" />
      <TutorPage />
    </>
  );
}
