import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { TranslatorPage } from "@/features/linguistic/translator/components/pages/TranslatorPage";

export const metadata: Metadata = {
  title: "Translator | Linguistic",
  description: "Contextual translation with a chosen tone and cultural notes.",
};

export default function TranslatorRoutePage() {
  return (
    <>
      <SetPageTitle title="Translator" />
      <TranslatorPage />
    </>
  );
}
