"use client";

import { FileCode2, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type EditorTab = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

const tabs: EditorTab[] = [
  {
    label: "home.tsx",
    href: "/",
    icon: FileCode2,
    isActive: (pathname) => pathname === "/",
  },
  {
    label: "blog.md",
    href: "/blog",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/blog"),
  },
  {
    label: "resume.md",
    href: "/resume",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/resume"),
  },
];

export function EditorTabsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 flex flex-col sm:flex-row items-center border-b border-border bg-card font-mono"
    >
      <Link
        href="/"
        className="flex items-center text-base font-extrabold px-4 py-2.5 sm:py-0"
      >
        craig<span className="text-[#f0805c]">.dev</span>
      </Link>
      <div className="flex w-full flex-row items-stretch justify-evenly sm:w-auto">
        {tabs.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex flex-1 sm:flex-auto items-center gap-2 border-r border-border bg-background px-4 py-2.5 text-[13px] text-foreground shadow-[inset_0_2px_0_0_var(--primary)] last:py-0"
                  : "flex flex-1 sm:flex-auto items-center gap-2 border-r border-border px-4 py-2.5 text-[13px] text-muted-foreground transition hover:bg-background hover:text-foreground shadow-[inset_0_2px_0_0_var(--muted)] last:py-0"
              }
            >
              <Icon className={active ? "size-3.5 text-primary" : "size-3.5"} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
