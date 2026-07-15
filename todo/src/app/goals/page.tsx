import { GoalsKanban } from "@/features/goals/components/GoalsKanban";

export default function GoalsPage() {
  return (
    <div className="min-h-screen bg-[#0a0d12] px-4 py-8 font-mono text-[#e9eef5] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#57a773]">
          goals
        </p>
        <h1 className="mb-6 text-2xl font-extrabold tracking-tighter">
          Kanban<span className="text-[#f0805c]">.</span>
        </h1>
        <GoalsKanban />
      </div>
    </div>
  );
}
