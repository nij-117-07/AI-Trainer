import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { RoleplayAssessPage } from "@/features/linguistic/language-tester/components/pages/RoleplayAssessPage";

export const metadata: Metadata = {
  title: "Roleplay Coach | Linguistic",
  description: "Converse with a character in your target language and get grammar feedback, a fluency score, and strategies.",
};

export default function RoleplayAssessRoutePage() {
  return (
    <>
      <SetPageTitle title="Roleplay Coach" />
      <RoleplayAssessPage />
    </>
  );
}
