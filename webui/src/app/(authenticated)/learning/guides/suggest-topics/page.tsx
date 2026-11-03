import { redirect } from "next/navigation";

export default function SuggestTopicsRedirectPage() {
  redirect("/learning/guides?tool=suggest-topics");
}