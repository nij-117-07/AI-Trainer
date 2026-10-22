import { redirect } from "next/navigation";

export default function SocraticRedirectPage() {
  redirect("/learning/explainer?tool=socratic");
}
