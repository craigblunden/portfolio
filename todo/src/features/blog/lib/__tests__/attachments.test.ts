import { afterEach, describe, expect, it, vi } from "vitest";
import { postsForGoal, postsForProject } from "../attachments";

const post = (slug: string, goals: string[] = [], projects: string[] = []) => ({
  slug,
  goals,
  projects,
});

const KNOWN_PROJECTS = ["portfolio-dashboard", "second-project-placeholder"];
const KNOWN_GOALS = ["land-next-senior-role", "keep-steady-reading-habit"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("postsForProject", () => {
  it("returns only posts attached to that project", () => {
    const posts = [
      post("a", [], ["portfolio-dashboard"]),
      post("b", [], ["second-project-placeholder"]),
      post("c"),
    ];

    expect(postsForProject(posts, "portfolio-dashboard", KNOWN_PROJECTS).map((p) => p.slug)).toEqual(
      ["a"],
    );
  });

  it("returns an empty list for a project with no posts, which is the common case", () => {
    const posts = [post("a", [], ["portfolio-dashboard"])];

    expect(postsForProject(posts, "second-project-placeholder", KNOWN_PROJECTS)).toEqual([]);
  });

  it("includes a post attached to several projects under each", () => {
    const posts = [post("a", [], ["portfolio-dashboard", "second-project-placeholder"])];

    expect(postsForProject(posts, "portfolio-dashboard", KNOWN_PROJECTS)).toHaveLength(1);
    expect(postsForProject(posts, "second-project-placeholder", KNOWN_PROJECTS)).toHaveLength(1);
  });

  // Static data, always available at build time — a dangling reference is a typo.
  it("throws on an unknown project slug", () => {
    const posts = [post("a", [], ["no-such-project"])];

    expect(() => postsForProject(posts, "portfolio-dashboard", KNOWN_PROJECTS)).toThrow(
      /no-such-project/,
    );
  });

  it("names the offending post in the error", () => {
    const posts = [post("my-post", [], ["no-such-project"])];

    expect(() => postsForProject(posts, "portfolio-dashboard", KNOWN_PROJECTS)).toThrow(/my-post/);
  });
});

describe("postsForGoal", () => {
  it("returns only posts attached to that goal", () => {
    const posts = [
      post("a", ["land-next-senior-role"]),
      post("b", ["keep-steady-reading-habit"]),
      post("c"),
    ];

    expect(postsForGoal(posts, "land-next-senior-role", KNOWN_GOALS).map((p) => p.slug)).toEqual([
      "a",
    ]);
  });

  it("returns an empty list for a goal with no posts, which is the common case", () => {
    expect(postsForGoal([post("a", ["land-next-senior-role"])], "keep-steady-reading-habit")).toEqual(
      [],
    );
  });

  it("includes a post attached to several goals under each", () => {
    const posts = [post("a", ["land-next-senior-role", "keep-steady-reading-habit"])];

    expect(postsForGoal(posts, "land-next-senior-role", KNOWN_GOALS)).toHaveLength(1);
    expect(postsForGoal(posts, "keep-steady-reading-habit", KNOWN_GOALS)).toHaveLength(1);
  });

  // Goals come from the API, which the build tolerates being down. Failing here
  // would mean an API outage breaks the frontend build.
  it("warns rather than throwing on an unknown goal slug", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const posts = [post("a", ["no-such-goal"])];

    expect(() => postsForGoal(posts, "land-next-senior-role", KNOWN_GOALS)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no-such-goal"));
  });

  it("skips validation entirely when the known goals are unavailable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const posts = [post("a", ["any-goal-at-all"])];

    expect(() => postsForGoal(posts, "any-goal-at-all")).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  it("still resolves attachments when the API is unreachable", () => {
    const posts = [post("a", ["land-next-senior-role"])];

    expect(postsForGoal(posts, "land-next-senior-role")).toHaveLength(1);
  });
});
