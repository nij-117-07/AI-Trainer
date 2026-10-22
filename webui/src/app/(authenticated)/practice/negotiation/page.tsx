import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { NegotiationPage } from "@/features/practice/negotiation/components/pages/NegotiationPage";

export const metadata: Metadata = {
  title: "Negotiation Practice | Practice",
  description: "Trade offers with an AI opponent in real time and get coached on your tactics.",
};

export default function NegotiationRoutePage() {
  return (
    <>
      <SetPageTitle title="Negotiation Practice" />
      <NegotiationPage />
    </>
  );
}
