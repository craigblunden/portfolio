import { afterEach, describe, expect, it, vi } from "vitest";
import { postsForGoal, postsForProject, validateAttachments } from "../attachments";

const post = (slug: string, goals: string[] = [], projects: string[] = []) => ({
  slug,
  goals,
  projects,
});

const KNOWN = {
  projects: ["portfolio-dashboard", "second-project-placeholder"],
  goals: ["land-next-senior-role", "keep-steady-reading-habit"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("validateAttachments", () => {
  it("accepts posts whose references all resolve", () => {
    const posts = [post("a", ["land-next-senior-role"], ["portfolio-dashboard"]), post("b")];

    expect(() => validateAttachments(posts, KNOWN)).not.toThrow();
  });

  // Static data, always available at build time — a dangling reference is a typo.
  it("throws on an unknown project slug", () => {
    expect(() => validateAttachments([post("a", [], ["no-such-project"])], KNOWN)).toThrow(
      /no-such-project/,
    );
  });

  it("names the offending post in the error", () => {
    expect(() => validateAttachments([post("my-post", [], ["nope"])], KNOWN)).toThrow(/my-post/);
  });

  // Goals come from the API, which the build tolerates being down. Throwing here
  // would mean an API outage breaks the frontend build.
  it("warns rather than throwing on an unknown goal slug", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => validateAttachments([post("a", ["no-such-goal"])], KNOWN)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no-such-goal"));
  });

  it("skips goal validation entirely when the API is unreachable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      validateAttachments([post("a", ["any-goal"])], { projects: KNOWN.projects }),
    ).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  // Previously validation lived inside the lookups, so rendering two goals produced
  // the same warning twice.
  it("warns once per bad reference, not once per lookup", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    validateAttachments([post("a", ["no-such-goal"])], KNOWN);

    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("postsForGoal", () => {
  it("returns only posts attached to that goal", () => {
    const posts = [
      post("a", ["land-next-senior-role"]),
      post("b", ["keep-steady-reading-habit"]),
      post("c"),
    ];

    expect(postsForGoal(posts, "land-next-senior-role").map((p) => p.slug)).toEqual(["a"]);
  });

  it("returns an empty list for a goal with no posts, which is the common case", () => {
    expect(postsForGoal([post("a", ["land-next-senior-role"])], "keep-steady-reading-habit")).toEqual(
      [],
    );
  });

  it("includes a post attached to several goals under each", () => {
    const posts = [post("a", ["land-next-senior-role", "keep-steady-reading-habit"])];

    expect(postsForGoal(posts, "land-next-senior-role")).toHaveLength(1);
    expect(postsForGoal(posts, "keep-steady-reading-habit")).toHaveLength(1);
  });

  it("does not validate, so an unresolvable reference cannot break rendering", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => postsForGoal([post("a", ["no-such-goal"])], "anything")).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("postsForProject", () => {
  it("returns only posts attached to that project", () => {
    const posts = [
      post("a", [], ["portfolio-dashboard"]),
      post("b", [], ["second-project-placeholder"]),
      post("c"),
    ];

    expect(postsForProject(posts, "portfolio-dashboard").map((p) => p.slug)).toEqual(["a"]);
  });

  it("returns an empty list for a project with no posts, which is the common case", () => {
    expect(postsForProject([post("a", [], ["portfolio-dashboard"])], "other")).toEqual([]);
  });

  it("includes a post attached to several projects under each", () => {
    const posts = [post("a", [], ["portfolio-dashboard", "second-project-placeholder"])];

    expect(postsForProject(posts, "portfolio-dashboard")).toHaveLength(1);
    expect(postsForProject(posts, "second-project-placeholder")).toHaveLength(1);
  });
});
