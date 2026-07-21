import Link from "next/link";
import { FileText } from "lucide-react";
import type { PostMeta } from "@/features/blog/api/posts";

/**
 * "Read more" links for a goal or project.
 *
 * Renders nothing when there are no attached articles — most goals and projects will
 * never have one, and absence is the normal case rather than an empty state to fill.
 */
export function AttachedArticles({
  posts,
  label = "read more",
}: {
  posts: PostMeta[];
  label?: string;
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-dashed border-border pt-3">
      <div className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold">
        <span className="text-accent-green">{"//"}</span>
        {label}
        <span className="text-[11px] text-faint">[{posts.length}]</span>
      </div>

      <ul className="space-y-1.5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="flex items-start gap-2 text-xs text-secondary-foreground transition hover:text-primary"
            >
              <FileText className="mt-0.5 size-3 shrink-0 text-subtle" />
              <span className="underline-offset-2 hover:underline">{post.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
