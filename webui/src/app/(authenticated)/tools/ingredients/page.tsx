import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { IngredientsPage } from "@/features/tools/ingredients/components/pages/IngredientsPage";

export const metadata: Metadata = {
  title: "Ingredients Checker | Tools",
  description: "Snap a photo of a product's ingredients list for a nutritional health analysis.",
};

export default function IngredientsRoutePage() {
  return (
    <>
      <SetPageTitle title="Ingredients Checker" />
      <IngredientsPage />
    </>
  );
}
