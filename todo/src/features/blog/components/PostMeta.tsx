import { Badge } from "@/components/ui/badge";
import type { PostMeta as PostMetaData } from "@/features/blog/api/posts";
import { formatPostDate } from "@/features/blog/lib/formatDate";

const statusStyles = {
  published: "bg-success/15 text-success",
  draft: "bg-primary/15 text-primary",
  planned: "bg-secondary text-muted-foreground",
} as const;

/** Date, reading time, and tags for a post header. */
export function PostMetaRow({ post }: { post: PostMetaData }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-subtle">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span className="text-faint">·</span>
      <span>{post.readingTime}</span>

      {post.updated ? (
        <>
          <span className="text-faint">·</span>
          <span>
            updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
          </span>
        </>
      ) : null}

      {post.status !== "published" ? (
        <Badge className={`border-0 font-mono ${statusStyles[post.status]}`}>{post.status}</Badge>
      ) : null}

      {post.tags.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-subtle">
              #{tag}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}
