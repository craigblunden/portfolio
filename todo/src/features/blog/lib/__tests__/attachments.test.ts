import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertProjectRefsResolve,
  findUnknownProjectRefs,
  postsForGoal,
  postsForProject,
  warnUnknownAttachments,
} from "../attachments";

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

describe("findUnknownProjectRefs", () => {
  it("returns an empty list when every project reference resolves", () => {
    const posts = [post("a", ["land-next-senior-role"], ["portfolio-dashboard"]), post("b")];

    expect(findUnknownProjectRefs(posts, KNOWN.projects)).toEqual([]);
  });

  it("returns a { post, project } entry for each dangling reference", () => {
    const posts = [post("a", [], ["portfolio-dashboard", "nope"]), post("b", [], ["gone"])];

    expect(findUnknownProjectRefs(posts, KNOWN.projects)).toEqual([
      { post: "a", project: "nope" },
      { post: "b", project: "gone" },
    ]);
  });
});

describe("assertProjectRefsResolve", () => {
  it("does not throw when every project reference resolves", () => {
    const posts = [post("a", [], ["portfolio-dashboard"]), post("b")];

    expect(() => assertProjectRefsResolve(posts, KNOWN.projects)).not.toThrow();
  });

  // Static data, bundled at build time — a dangling reference is a typo that should
  // fail the deploy loudly rather than 500 a live render.
  it("throws naming the unknown project", () => {
    expect(() =>
      assertProjectRefsResolve([post("a", [], ["no-such-project"])], KNOWN.projects),
    ).toThrow(/no-such-project/);
  });

  it("throws naming the offending post", () => {
    expect(() =>
      assertProjectRefsResolve([post("my-post", [], ["nope"])], KNOWN.projects),
    ).toThrow(/my-post/);
  });
});

describe("warnUnknownAttachments", () => {
  // The build gate already guarantees projects resolve, so a stray one at runtime is
  // a warning and a skipped link — never a thrown error that takes down the render.
  it("warns rather than throwing on an unknown project slug", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      warnUnknownAttachments([post("a", [], ["no-such-project"])], KNOWN),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no-such-project"));
  });

  // Goals come from the API, which the frontend tolerates being down. Throwing here
  // would let an API outage break the render.
  it("warns rather than throwing on an unknown goal slug", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => warnUnknownAttachments([post("a", ["no-such-goal"])], KNOWN)).not.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no-such-goal"));
  });

  it("skips goal validation entirely when the API is unreachable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      warnUnknownAttachments([post("a", ["any-goal"])], { projects: KNOWN.projects }),
    ).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  // Previously validation lived inside the lookups, so rendering two goals produced
  // the same warning twice.
  it("warns once per bad reference, not once per lookup", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnUnknownAttachments([post("a", ["no-such-goal"])], KNOWN);

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
