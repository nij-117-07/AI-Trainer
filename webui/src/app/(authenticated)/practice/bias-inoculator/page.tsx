import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { BiasInoculatorPage } from "@/features/practice/bias-inoculator/components/pages/BiasInoculatorPage";

export const metadata: Metadata = {
  title: "Cognitive Bias Inoculator | Practice",
  description: "Get dropped into stealthy scenarios where cognitive biases try to trip you up.",
};

export default function BiasInoculatorRoutePage() {
  return (
    <>
      <SetPageTitle title="Cognitive Bias Inoculator" />
      <BiasInoculatorPage />
    </>
  );
}
