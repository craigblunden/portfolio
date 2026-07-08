"use client";

import { Button } from "@/components/ui/button";

export function AdminSessionButton() {
  return (
    <Button
      variant="outline"
      className="w-full border-[#232b36] bg-[#151a22] font-mono text-[#8b97a7] hover:bg-[#1e2630] hover:text-[#e9eef5] sm:w-auto"
      onClick={async () => {
        await fetch("/api/auth/logout", {
          cache: "no-store",
        });
        window.location.assign("/");
      }}
    >
      sign out
    </Button>
  );
}
