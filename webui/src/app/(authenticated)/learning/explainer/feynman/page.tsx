import { redirect } from "next/navigation";

export default function FeynmanRedirectPage() {
  redirect("/learning/explainer?tool=feynman");
}
