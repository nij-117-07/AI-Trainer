import { Metadata } from "next";
import { AdminContainer } from "@/features/masteradmin/admin/components/AdminContainer";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Page Manager | Admin",
  description: "Create, edit, and manage dashboard pages.",
};

export default function AdminPagesPage() {
  return (
    <>
      <SetPageTitle title="Page Manager" />
      <AdminContainer />
    </>
  );
}
