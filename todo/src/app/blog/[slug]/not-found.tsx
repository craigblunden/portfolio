import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function PostNotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-16 font-mono text-foreground">
      <div className="text-center">
        <FileQuestion className="mx-auto mb-4 size-8 text-subtle" />
        <h1 className="mb-2 text-xl font-bold tracking-[-0.02em]">article not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This article doesn&apos;t exist, or hasn&apos;t been published yet.
        </p>
        <Link
          href="/blog"
          className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
        >
          browse all articles
        </Link>
      </div>
    </div>
  );
}
