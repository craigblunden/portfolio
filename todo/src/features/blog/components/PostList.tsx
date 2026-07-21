import type { PostMeta } from "@/features/blog/api/posts";
import { PostCard } from "@/features/blog/components/PostCard";

export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-subtle">
        No articles published yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
