import type { Frontmatter } from "./frontmatter";

/**
 * Status predicates live here, apart from the loaders in `api/posts.ts`.
 *
 * That module imports `node:fs/promises`, so a client component importing a
 * predicate from it drags the filesystem into the browser bundle and the build
 * fails. These are pure functions over a string union with no reason to sit behind
 * that import.
 */

export type PostStatus = Frontmatter["status"];

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
