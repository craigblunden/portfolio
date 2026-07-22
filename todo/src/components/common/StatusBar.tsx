import { Crosshair, GitBranch, OctagonAlert, TriangleAlert } from "lucide-react";

/**
 * The editor status bar, rendered once in the root layout for every route.
 *
 * Sticky rather than merely last in the flow: the tab strip above is sticky too, so
 * the two together frame the content the way an editor chrome does instead of the
 * bar scrolling away on long pages.
 *
 * Deliberately carries only site-wide state. Page-specific readouts would mean every
 * route fetching data for a strip of chrome, which is a poor trade for a footer.
 */
export function StatusBar() {
  return (
    <footer className="sticky bottom-0 z-40 flex items-center gap-4 overflow-x-auto border-t border-border bg-primary px-3 py-1 text-[12px] font-semibold text-primary-foreground">
      <span className="flex items-center gap-1">
        <GitBranch className="size-3" />
        develop
      </span>
      <span className="flex items-center gap-1">
        <OctagonAlert className="size-3" />
        0
        <TriangleAlert className="ml-1 size-3" />
        0
      </span>
      <span className="hidden sm:inline">open_to_work: true</span>
      <span className="ml-auto flex items-center gap-1 whitespace-nowrap">
        <Crosshair className="size-3" />
        target: nov 2026
      </span>
      <span className="hidden sm:inline">TypeScript React</span>
      <span className="hidden sm:inline">UTF-8</span>
    </footer>
  );
}
