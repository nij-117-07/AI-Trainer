import { redirect } from "next/navigation";

export default function CurriculumRedirectPage() {
  redirect("/learning/explainer?tool=curriculum");
}
