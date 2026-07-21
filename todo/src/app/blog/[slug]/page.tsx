import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadPostBySlug, loadRoutablePosts } from "@/features/blog/api/posts";
import { PostBody } from "@/features/blog/components/PostBody";
import { PostMetaRow } from "@/features/blog/components/PostMeta";
import { postJsonLd } from "@/features/blog/lib/jsonLd";

/** Every post is known at build time, so an unlisted slug is a 404, not a miss. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await loadRoutablePosts();

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    // Drafts are reachable in dev only, but the tag costs nothing and guards
    // against one ever being served in production by mistake.
    robots: post.status === "published" ? undefined : { index: false, follow: false },
  };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }}
      />

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
