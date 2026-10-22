import { redirect } from "next/navigation";

export default function OrchestrateRedirectPage() {
  redirect("/learning/explainer?tool=orchestrate");
}
