import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { type Frontmatter, parseFrontmatter } from "@/features/blog/lib/frontmatter";
import { renderMarkdown } from "@/features/blog/lib/markdown";
import { getReadingTime } from "@/features/blog/lib/readingTime";
import { slugFromFilename } from "@/features/blog/lib/slug";

export type PostStatus = Frontmatter["status"];

export type PostMeta = Frontmatter & {
  slug: string;
  readingTime: string;
};

export type Post = PostMeta & {
  html: string;
};

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Has its own page at /blog/<slug>.
 *
 * Only published posts do. A planned post is an unwritten placeholder with no body,
 * and a draft is deliberately not shown yet — linking either is a guaranteed 404.
 */
export function isRoutable(status: PostStatus): boolean {
  return status === "published";
}

/**
 * Appears anywhere in the UI.
 *
 * Drafts never render, in any environment. To preview one, set its status to
 * published locally — that is a single-word edit, and it keeps "what I can see" the
 * same everywhere instead of diverging between dev and production.
 */
export function isListable(status: PostStatus): boolean {
  return status !== "draft";
}

/** Newest first, with slug as a deterministic tie-break so ordering never wobbles. */
export function sortByDateDesc<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

type LoadOptions = {
  dir?: string;
};

async function readPostFile(dir: string, filename: string) {
  const raw = await readFile(path.join(dir, filename), "utf8");
  const { data, content } = matter(raw);

  return {
    frontmatter: parseFrontmatter(data, filename),
    slug: slugFromFilename(filename),
    content,
  };
}

type LoadedPost = {
  meta: PostMeta;
  content: string;
};

/**
 * Reads and parses every post in the directory.
 *
 * Wrapped in cache() so the several loaders a single page calls — generateMetadata,
 * generateStaticParams, the page body — share one read per render pass instead of
 * re-scanning the directory each time.
 */
const readAll = cache(async (dir: string): Promise<LoadedPost[]> => {
  const filenames = (await readdir(dir)).filter((name) => name.endsWith(".md"));

  return Promise.all(
    filenames.map(async (filename) => {
      const { frontmatter, slug, content } = await readPostFile(dir, filename);

      return {
        meta: { ...frontmatter, slug, readingTime: getReadingTime(content) },
        content,
      };
    }),
  );
});

/** Everything that appears in listings, including planned placeholders. */
export async function loadAllPosts({ dir = BLOG_DIR }: LoadOptions = {}): Promise<PostMeta[]> {
  const posts = await readAll(dir);

  return sortByDateDesc(
    posts.filter((post) => isListable(post.meta.status)).map((post) => post.meta),
  );
}

/** Posts with their own page — drives generateStaticParams and the /blog index. */
export async function loadRoutablePosts({ dir = BLOG_DIR }: LoadOptions = {}): Promise<PostMeta[]> {
  const posts = await readAll(dir);

  return sortByDateDesc(
    posts.filter((post) => isRoutable(post.meta.status)).map((post) => post.meta),
  );
}

async function findRoutable(slug: string, dir: string): Promise<LoadedPost | null> {
  const post = (await readAll(dir)).find((candidate) => candidate.meta.slug === slug);

  return post && isRoutable(post.meta.status) ? post : null;
}

/**
 * Metadata only, without rendering the body.
 *
 * generateMetadata needs the frontmatter but never the HTML, and rendering runs Shiki
 * over every code fence — expensive work whose output would be thrown away.
 *
 * Returns null rather than throwing so a route can render its own not-found.
 */
export async function loadPostMetaBySlug(
  slug: string,
  { dir = BLOG_DIR }: LoadOptions = {},
): Promise<PostMeta | null> {
  const post = await findRoutable(slug, dir);

  return post?.meta ?? null;
}

/** Metadata plus the rendered body. Returns null rather than throwing. */
export async function loadPostBySlug(
  slug: string,
  { dir = BLOG_DIR }: LoadOptions = {},
): Promise<Post | null> {
  const post = await findRoutable(slug, dir);

  if (!post) {
    return null;
  }

  return { ...post.meta, html: await renderMarkdown(post.content) };
}
