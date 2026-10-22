import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { FibPage } from "@/features/linguistic/language-tester/components/pages/FibPage";

export const metadata: Metadata = {
  title: "Fill in the Blank | Linguistic",
  description: "Generate fill-in-the-blank sentences and get answers evaluated for typos and grammar.",
};

export default function FibRoutePage() {
  return (
    <>
      <SetPageTitle title="Fill in the Blank" />
      <FibPage />
    </>
  );
}
