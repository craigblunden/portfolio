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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card px-4 py-3 font-mono text-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-green">
            admin
          </span>
          <Link
            href="/admin/todos"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Todos
          </Link>
          <Link
            href="/admin/goals"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Goals
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
