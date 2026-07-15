import { getAdminSession } from "@/features/auth/api/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session.isAdmin) {
    redirect("/admin/sign-in");
  }

  return <>{children}</>;
}
