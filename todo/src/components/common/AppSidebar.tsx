"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Code2, Home, Layers3, Menu, Rocket, Zap } from "lucide-react";
import Link from "next/link";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  badge?: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "home", icon: Home, shortcut: "1", active: true },
  { label: "goals", icon: Zap, shortcut: "2" },
  // { label: "writing", icon: BookOpen, shortcut: "3" },
  // { label: "timeline", icon: Calendar, badge: "6m" },
];

const listItems = [
  { label: "resume", icon: Layers3, count: 4 },
  { label: "projects", icon: Rocket, count: 2 },
  // { label: "commits", icon: GitBranch, count: 3 },
  { label: "job-search", icon: Code2, count: 5 },
];

export function AppSidebar() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#232b36] bg-[#0e1218]/95 px-4 font-mono text-[#e9eef5] backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center text-base font-extrabold ">
          craig<span className="text-[#f0805c]">.dev</span>
        </Link>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="border-[#232b36] bg-[#151a22] text-[#e9eef5] hover:bg-[#1e2630]"
              />
            }
          >
            <Menu className="size-4" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[86vw] max-w-[320px] border-[#232b36] bg-[#0e1218] p-0 font-mono text-[#e9eef5]"
          >
            <SheetHeader className="border-b border-[#232b36] p-4 text-left">
              <SheetTitle className="font-mono text-base font-extrabold tracking-[-0.04em] text-[#e9eef5]">
                craig<span className="text-[#f0805c]">.dev</span>
              </SheetTitle>
            </SheetHeader>
            <SidebarContent className="p-3" />
          </SheetContent>
        </Sheet>
      </header>

      <aside className="hidden border-r border-[#232b36] bg-[#0e1218] p-3 font-mono lg:block">
        <Link
          href="/"
          className="mb-6 flex items-center px-2 text-base font-extrabold tracking-[-0.04em] text-[#e9eef5]"
        >
          craig <span className="text-[#f0805c]">.dev</span>
        </Link>
        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent({ className }: { className?: string }) {
  return (
    <div className={className}>
      <NavGroup>
        {navItems.map(({ label, icon: Icon, shortcut, badge, active }) => (
          <Link
            key={label}
            href="/"
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-[13px] transition ${
              active
                ? "bg-[#1e2630] text-[#e9eef5]"
                : "text-[#8b97a7] hover:bg-[#151a22] hover:text-[#e9eef5]"
            }`}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {badge ? (
              <span className="rounded bg-[#f0805c]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#f0805c]">
                {badge}
              </span>
            ) : (
              <span className="text-[11px] text-[#404a59]">{shortcut}</span>
            )}
          </Link>
        ))}
      </NavGroup>

      <SectionLabel>site</SectionLabel>
      <NavGroup>
        {listItems.map(({ label, icon: Icon, count }) => (
          <Link
            key={label}
            href="/"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-[13px] text-[#8b97a7] transition hover:bg-[#151a22] hover:text-[#e9eef5]"
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            <span className="text-[11px] text-[#404a59]">{count}</span>
          </Link>
        ))}
      </NavGroup>
    </div>
  );
}

function NavGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-2 pt-5 text-[11px] font-medium text-[#57a773]">
      {"// "}
      {children}
    </div>
  );
}
