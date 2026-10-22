import { Metadata } from "next";
import { getAllUsers } from "@/features/auth/actions/admin";
import { UserManagement } from "@/features/auth/components/user-management";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage user accounts, roles, and permissions.",
};

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <>
      <SetPageTitle title="User Management" />
      <UserManagement initialUsers={users} />
    </>
  );
}
