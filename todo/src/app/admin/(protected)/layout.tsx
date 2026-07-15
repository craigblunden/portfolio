import { getAdminSession } from "@/features/auth/api/session";
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
    <div className="min-h-screen bg-[#0a0d12]">
      <nav className="border-b border-[#232b36] bg-[#0e1218] px-4 py-3 font-mono text-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
            admin
          </span>
          <Link
            href="/admin/todos"
            className="text-[#8b97a7] transition hover:text-[#e9eef5]"
          >
            Todos
          </Link>
          <Link
            href="/admin/goals"
            className="text-[#8b97a7] transition hover:text-[#e9eef5]"
          >
            Goals
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
