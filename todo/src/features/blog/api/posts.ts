import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
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
 * Drafts are visible everywhere except a production build. Keyed off "is production"
 * rather than "is development" so test runs behave like dev and can exercise both
 * branches without faking NODE_ENV.
 */
const draftsVisibleByDefault = () => process.env.NODE_ENV !== "production";

/** Has its own page at /blog/<slug>. Planned posts are placeholders with no content. */
export function isRoutable(status: PostStatus, includeDrafts: boolean): boolean {
  if (status === "planned") return false;
  return status === "published" || includeDrafts;
}

/** Appears in listings. Planned posts show as non-clickable cards on the homepage. */
export function isListable(status: PostStatus, includeDrafts: boolean): boolean {
  return status !== "draft" || includeDrafts;
}

/** Newest first, with slug as a deterministic tie-break so ordering never wobbles. */
export function sortByDateDesc<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
}

type LoadOptions = {
  dir?: string;
  includeDrafts?: boolean;
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

async function readAll(dir: string): Promise<Array<PostMeta & { content: string }>> {
  const filenames = (await readdir(dir)).filter((name) => name.endsWith(".md"));

  return Promise.all(
    filenames.map(async (filename) => {
      const { frontmatter, slug, content } = await readPostFile(dir, filename);

      return {
        ...frontmatter,
        slug,
        readingTime: getReadingTime(content),
        content,
      };
    }),
  );
}

/** Everything that appears in listings, including planned placeholders. */
export async function loadAllPosts({
  dir = BLOG_DIR,
  includeDrafts = draftsVisibleByDefault(),
}: LoadOptions = {}): Promise<PostMeta[]> {
  const posts = await readAll(dir);

  return sortByDateDesc(
    posts
      .filter((post) => isListable(post.status, includeDrafts))
      .map(({ content: _content, ...meta }) => meta),
  );
}

/** Posts with their own page — drives generateStaticParams and the /blog index. */
export async function loadRoutablePosts({
  dir = BLOG_DIR,
  includeDrafts = draftsVisibleByDefault(),
}: LoadOptions = {}): Promise<PostMeta[]> {
  const posts = await readAll(dir);

  return sortByDateDesc(
    posts
      .filter((post) => isRoutable(post.status, includeDrafts))
      .map(({ content: _content, ...meta }) => meta),
  );
}

/** Returns null rather than throwing so a route can render its own not-found. */
export async function loadPostBySlug(
  slug: string,
  { dir = BLOG_DIR, includeDrafts = draftsVisibleByDefault() }: LoadOptions = {},
): Promise<Post | null> {
  const posts = await readAll(dir);
  const post = posts.find((candidate) => candidate.slug === slug);

  if (!post || !isRoutable(post.status, includeDrafts)) {
    return null;
  }

  const { content, ...meta } = post;

  return { ...meta, html: await renderMarkdown(content) };
}
