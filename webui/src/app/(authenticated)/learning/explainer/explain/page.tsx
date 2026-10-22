import { redirect } from "next/navigation";

export default function ExplainRedirectPage() {
  redirect("/learning/explainer?tool=explain");
}
