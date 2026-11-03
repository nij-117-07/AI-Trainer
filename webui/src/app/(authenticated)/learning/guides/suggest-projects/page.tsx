import { redirect } from "next/navigation";

export default function SuggestProjectsRedirectPage() {
  redirect("/learning/guides?tool=suggest-projects");
}