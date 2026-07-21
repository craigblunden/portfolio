import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadPostBySlug, loadRoutablePosts } from "@/features/blog/api/posts";
import { PostBody } from "@/features/blog/components/PostBody";
import { PostMetaRow } from "@/features/blog/components/PostMeta";

/** Every post is known at build time, so an unlisted slug is a 404, not a miss. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await loadRoutablePosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-full bg-background font-mono text-foreground">
      <article className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-[11px] text-subtle transition hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          all articles
        </Link>

        <header className="mb-7 border-b border-border pb-5">
          <h1 className="mb-2 text-2xl font-extrabold leading-tight tracking-[-0.03em]">
            {post.title}
          </h1>
          <PostMetaRow post={post} />
        </header>

        <PostBody html={post.html} />
      </article>
    </div>
  );
}
