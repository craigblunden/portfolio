import { PenLine } from "lucide-react";
import { loadRoutablePosts } from "@/features/blog/api/posts";
import { PostList } from "@/features/blog/components/PostList";

export default async function BlogIndexPage() {
  const posts = await loadRoutablePosts();

  return (
    <div className="flex-1 bg-background font-mono text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <PenLine className="size-3.5 text-accent-green" />
            <h1 className="mb-0 text-xl font-extrabold tracking-[-0.03em]">articles</h1>
            <span className="text-xs font-medium text-faint">[{posts.length}]</span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Notes on what I&apos;m learning — engineering craft, the tools I build with, and
            the occasional thing I got wrong.
          </p>
        </header>

        <PostList posts={posts} />
      </div>
    </div>
  );
}
