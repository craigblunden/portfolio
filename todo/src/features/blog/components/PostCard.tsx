import Link from "next/link";
import { Card } from "@/components/ui/card";
import { isRoutable, type PostMeta } from "@/features/blog/api/posts";
import { PostMetaRow } from "@/features/blog/components/PostMeta";

/**
 * A post summary. Posts without a page of their own render as a non-interactive card
 * rather than a link to nowhere — isRoutable is the same rule the router uses.
 */
export function PostCard({ post }: { post: PostMeta }) {
  const linkable = isRoutable(post.status);

  const card = (
    <Card
      size="sm"
      className={`gap-2 rounded-lg border border-border bg-card p-4 py-4 shadow-none ring-0 ${
        linkable ? "transition hover:border-primary/30" : ""
      }`}
    >
      <h3 className="text-sm font-semibold tracking-[-0.02em]">{post.title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{post.description}</p>
      <PostMetaRow post={post} />
    </Card>
  );

  if (!linkable) {
    return card;
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      {card}
    </Link>
  );
}
