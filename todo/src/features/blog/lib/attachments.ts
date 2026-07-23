import type { PostMeta } from "@/features/blog/api/posts";

type Attachable = Pick<PostMeta, "slug" | "goals" | "projects">;

type KnownSlugs = {
  projects: readonly string[];
  /** Omitted when the API is unreachable, which skips goal validation entirely. */
  goals?: readonly string[];
};

/** A post's reference to a project slug that does not exist in projectsData. */
export type UnknownProjectRef = { post: string; project: string };

/**
 * Every dangling project reference across the given posts, in order.
 *
 * Pure and side-effect free on purpose: it is the single source of truth shared by
 * both failure policies. The build gate (assertProjectRefsResolve) turns a non-empty
 * result into a thrown error so a bad reference fails `pnpm build`; the runtime path
 * (warnUnknownAttachments) logs the same list and lets the lookups below skip it. If
 * detection lived in each caller instead, the two could quietly drift apart.
 */
export function findUnknownProjectRefs(
  posts: Attachable[],
  knownProjects: readonly string[],
): UnknownProjectRef[] {
  const known = new Set(knownProjects);
  const unknown: UnknownProjectRef[] = [];

  for (const post of posts) {
    for (const project of post.projects) {
      if (!known.has(project)) {
        unknown.push({ post: post.slug, project });
      }
    }
  }

  return unknown;
}

/**
 * Build-time gate. Throws when any post references a project not in projectsData.
 *
 * projectsData is static and bundled, so this is fully checkable before the app runs.
 * Run from the content-integrity test that `pnpm build` invokes via `prebuild`, so a
 * dangling reference fails the deploy loudly instead of 500ing a live page — which is
 * exactly what a stale build once did on the dashboard.
 */
export function assertProjectRefsResolve(
  posts: Attachable[],
  knownProjects: readonly string[],
): void {
  const unknown = findUnknownProjectRefs(posts, knownProjects);
  if (unknown.length === 0) {
    return;
  }

  const known = [...knownProjects].join(", ") || "(none)";
  const details = unknown
    .map(({ post, project }) => `  - "${post}" references unknown project "${project}"`)
    .join("\n");

  throw new Error(
    `Blog posts reference projects not in projectsData:\n${details}\n` +
      `Known projects: ${known}.`,
  );
}

/**
 * Runtime counterpart. Never throws.
 *
 * The build gate already guarantees project references resolve, so a stray one here
 * means the gate was bypassed — worth a warning, but not worth taking down the whole
 * dashboard render. The link is dropped by the filters below rather than crashing the
 * page. Unknown goals stay warn-only for the original reason: they come from the API,
 * which the frontend already tolerates being down.
 */
export function warnUnknownAttachments(posts: Attachable[], known: KnownSlugs): void {
  for (const { post, project } of findUnknownProjectRefs(posts, known.projects)) {
    console.warn(
      `[blog] Post "${post}" references unknown project "${project}". ` +
        `The link will be skipped.`,
    );
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
