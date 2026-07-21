import Link from "next/link";
import { FileText } from "lucide-react";
import { isRoutable, type PostMeta } from "@/features/blog/api/posts";

/**
 * "Read more" links for a goal or project.
 *
 * Only articles with a page of their own are shown. A post can be attached to a goal
 * before it is written, and linking a planned or draft post would be a guaranteed
 * 404 — isRoutable is the same rule the router uses, so the two cannot disagree.
 *
 * Renders nothing when nothing is linkable — most goals and projects will never have
 * an article, and absence is the normal case rather than an empty state to fill.
 */
export function AttachedArticles({
  posts,
  label = "read more",
}: {
  posts: PostMeta[];
  label?: string;
}) {
  const linkable = posts.filter((post) => isRoutable(post.status));

  if (linkable.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-dashed border-border pt-3">
      <div className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold">
        <span className="text-accent-green">{"//"}</span>
        {label}
        <span className="text-[11px] text-faint">[{linkable.length}]</span>
      </div>

      <ul className="space-y-1.5">
        {linkable.map((post) => (
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
