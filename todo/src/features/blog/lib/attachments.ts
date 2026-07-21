import type { PostMeta } from "@/features/blog/api/posts";

type Attachable = Pick<PostMeta, "slug" | "goals" | "projects">;

type KnownSlugs = {
  projects: readonly string[];
  /** Omitted when the API is unreachable, which skips goal validation entirely. */
  goals?: readonly string[];
};

/**
 * Checks every attachment reference once, before any lookups.
 *
 * Validation is deliberately separate from the filters below: doing it inside a
 * lookup would re-check every post on every call and emit the same warning once per
 * goal on the page.
 *
 * Unknown project slugs throw — projectsData is static and always available, so a
 * dangling reference is a typo with no excuse. Unknown goal slugs only warn, because
 * goals come from the API, the frontend build already tolerates it being down, and an
 * attachment is a supplementary link rather than load-bearing data.
 */
export function validateAttachments(posts: Attachable[], known: KnownSlugs): void {
  const knownProjects = new Set(known.projects);

  for (const post of posts) {
    for (const slug of post.projects) {
      if (!knownProjects.has(slug)) {
        throw new Error(
          `Post "${post.slug}" references unknown project "${slug}". ` +
            `Known projects: ${[...knownProjects].join(", ") || "(none)"}.`,
        );
      }
    }
  }

  if (!known.goals) {
    return;
  }

  const knownGoals = new Set(known.goals);

  for (const post of posts) {
    for (const slug of post.goals) {
      if (!knownGoals.has(slug)) {
        console.warn(
          `[blog] Post "${post.slug}" references unknown goal "${slug}". ` +
            `The attachment will be skipped.`,
        );
      }
    }
  }
}

/** Posts attached to a given goal. Usually empty — most goals have no articles. */
export function postsForGoal<T extends Attachable>(posts: T[], goalSlug: string): T[] {
  return posts.filter((post) => post.goals.includes(goalSlug));
}

/** Posts attached to a given project. Usually empty. */
export function postsForProject<T extends Attachable>(posts: T[], projectSlug: string): T[] {
  return posts.filter((post) => post.projects.includes(projectSlug));
}
