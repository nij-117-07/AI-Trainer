import { redirect } from "next/navigation";

export default function GuideTaskRedirectPage() {
  redirect("/learning/guides?tool=task");
}