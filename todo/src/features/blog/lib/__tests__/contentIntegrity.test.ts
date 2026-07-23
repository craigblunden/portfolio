// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadAllPosts } from "@/features/blog/api/posts";
import { projects } from "@/features/dashboard/data/projectsData";
import { assertProjectRefsResolve, findUnknownProjectRefs } from "../attachments";

/**
 * The build gate. `pnpm build` runs this file via the `prebuild` script, so a blog
 * post pointing at a project that isn't in projectsData fails the deploy here instead
 * of throwing on a live dashboard render.
 *
 * It validates real content against real projectsData — the two static inputs that a
 * production build bakes in — so it catches the exact drift that a stale build once
 * shipped: a post referencing a project that had since been removed.
 */
describe("content integrity", () => {
  it("every listable blog post references only known projects", async () => {
    const posts = await loadAllPosts();
    const knownProjects = projects.map((project) => project.slug);

    // Reported together, with post + project slugs, so a failure is actionable.
    expect(findUnknownProjectRefs(posts, knownProjects)).toEqual([]);
    expect(() => assertProjectRefsResolve(posts, knownProjects)).not.toThrow();
  });
});
