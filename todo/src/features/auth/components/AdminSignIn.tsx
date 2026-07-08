import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AdminSignIn() {
  return (
    <Link
      className={cn(
        buttonVariants(),
        "bg-[#f0805c] font-mono text-[#1a0f0a] hover:bg-[#f59377]",
      )}
      href="/api/auth/login?returnUrl=/"
      prefetch={false}
    >
      Sign in with Google
    </Link>
  );
}
