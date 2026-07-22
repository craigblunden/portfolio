import { getAdminSession } from "@/features/auth/api/session";
import { AdminSessionButton } from "@/features/auth/components/AdminSessionButton";
import Link from "next/link";
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

  return (
    <div className="flex-1 bg-background">
      <nav className="border-b border-border bg-card px-4 py-3 font-mono text-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-green">
            admin
          </span>
          <Link
            href="/admin"
            className="font-semibold text-foreground transition hover:text-foreground"
          >
            Goals & Todos
          </Link>
          <div className="ml-auto">
            <AdminSessionButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
