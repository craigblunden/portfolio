export function DashboardSection({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="mb-0 flex gap-2 text-sm font-semibold tracking-[-0.02em] items-center">
          <span className="text-[#57a773] tracking-[-.25em] text-[1rem]">
            {"//"}
          </span>
          {title}
          <span className="text-xs font-medium text-[#404a59]">[{count}]</span>
        </h2>
        <span className="h-px flex-1 bg-[#232b36]" />
        {action}
      </div>
      {children}
    </section>
  );
}
