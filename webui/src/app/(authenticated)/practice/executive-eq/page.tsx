import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ExecutiveEqPage } from "@/features/practice/executive-eq/components/pages/ExecutiveEqPage";

export const metadata: Metadata = {
  title: "Executive EQ Trainer | Practice",
  description: "Communicate through subtext in high-stakes corporate scenarios and get graded on your EQ.",
};

export default function ExecutiveEqRoutePage() {
  return (
    <>
      <SetPageTitle title="Executive EQ Trainer" />
      <ExecutiveEqPage />
    </>
  );
}
