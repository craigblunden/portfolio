import type { PostMeta } from "@/features/blog/api/posts";

type Attachable = Pick<PostMeta, "slug" | "goals" | "projects">;

/**
 * Posts attached to a given project.
 *
 * Project slugs are validated: projectsData is static and always available at build
 * time, so a dangling reference is a typo with no excuse and fails the build.
 */
export function postsForProject<T extends Attachable>(
  posts: T[],
  projectSlug: string,
  knownProjectSlugs: readonly string[],
): T[] {
  assertKnownProjects(posts, knownProjectSlugs);

  return posts.filter((post) => post.projects.includes(projectSlug));
}

/**
 * Posts attached to a given goal.
 *
 * Goal slugs are NOT fatal when unknown. Goals live in the .NET API, which the
 * frontend build already tolerates being unreachable, and an attachment is a
 * supplementary "read more" link rather than load-bearing data. Failing the build
 * over an API outage would be a worse outcome than a missing link.
 */
export function postsForGoal<T extends Attachable>(
  posts: T[],
  goalSlug: string,
  knownGoalSlugs?: readonly string[],
): T[] {
  if (knownGoalSlugs) {
    warnUnknownGoals(posts, knownGoalSlugs);
  }

  return posts.filter((post) => post.goals.includes(goalSlug));
}

function assertKnownProjects(posts: Attachable[], knownProjectSlugs: readonly string[]) {
  const known = new Set(knownProjectSlugs);

  for (const post of posts) {
    for (const slug of post.projects) {
      if (!known.has(slug)) {
        throw new Error(
          `Post "${post.slug}" references unknown project "${slug}". ` +
            `Known projects: ${[...known].join(", ") || "(none)"}.`,
        );
      }
    }
  }
}

function warnUnknownGoals(posts: Attachable[], knownGoalSlugs: readonly string[]) {
  const known = new Set(knownGoalSlugs);

  for (const post of posts) {
    for (const slug of post.goals) {
      if (!known.has(slug)) {
        console.warn(
          `[blog] Post "${post.slug}" references unknown goal "${slug}". ` +
            `The attachment will be skipped.`,
        );
      }
    }
  }
}
