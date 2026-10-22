import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { IdiomGeneratorPage } from "@/features/linguistic/idioms/components/pages/IdiomGeneratorPage";

export const metadata: Metadata = {
  title: "Idioms | Linguistic",
  description: "Learn an idiomatic expression in a target language with meaning and cultural context.",
};

export default function IdiomsRoutePage() {
  return (
    <>
      <SetPageTitle title="Idioms" />
      <IdiomGeneratorPage />
    </>
  );
}
