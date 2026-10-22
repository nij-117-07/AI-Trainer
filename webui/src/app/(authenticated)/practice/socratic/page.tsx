import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { SocraticPage } from "@/features/practice/socratic/components/pages/SocraticPage";

export const metadata: Metadata = {
  title: "Socratic Trainer | Practice",
  description: "Stress-test your beliefs with falsification questions and edge-case scenarios.",
};

export default function SocraticRoutePage() {
  return (
    <>
      <SetPageTitle title="Socratic Trainer" />
      <SocraticPage />
    </>
  );
}
