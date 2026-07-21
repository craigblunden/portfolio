import { AdminGoals } from "@/features/admin/components/AdminGoals";

export default function AdminPage() {
  return (
    <div className="px-4 py-8 font-mono text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tighter">
          Goals &amp; Todos<span className="text-primary">.</span>
        </h1>
        <AdminGoals />
      </div>
    </div>
  );
}
