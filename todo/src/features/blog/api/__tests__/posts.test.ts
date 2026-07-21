import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isListable,
  isRoutable,
  loadAllPosts,
  loadPostBySlug,
  loadRoutablePosts,
  sortByDateDesc,
} from "../posts";

const dir = path.join(__dirname, "fixtures");

const slugsOf = (posts: Array<{ slug: string }>) => posts.map((post) => post.slug);

describe("isRoutable", () => {
  it("routes published posts", () => {
    expect(isRoutable("published", false)).toBe(true);
  });

  it("routes drafts only when drafts are included", () => {
    expect(isRoutable("draft", true)).toBe(true);
    expect(isRoutable("draft", false)).toBe(false);
  });

  // A planned post is a placeholder for something unwritten — it has no body, so a
  // page for it would be an empty page.
  it("never routes planned posts, even with drafts included", () => {
    expect(isRoutable("planned", true)).toBe(false);
  });
});

describe("isListable", () => {
  it("lists published and planned posts", () => {
    expect(isListable("published", false)).toBe(true);
    expect(isListable("planned", false)).toBe(true);
  });

  it("lists drafts only when drafts are included", () => {
    expect(isListable("draft", true)).toBe(true);
    expect(isListable("draft", false)).toBe(false);
  });
});

describe("sortByDateDesc", () => {
  it("puts the newest post first", () => {
    const sorted = sortByDateDesc([
      { date: "2026-01-01", slug: "old" },
      { date: "2026-06-01", slug: "new" },
    ]);

    expect(slugsOf(sorted)).toEqual(["new", "old"]);
  });

  it("breaks ties on slug so ordering is deterministic", () => {
    const sorted = sortByDateDesc([
      { date: "2026-01-01", slug: "b" },
      { date: "2026-01-01", slug: "a" },
    ]);

    expect(slugsOf(sorted)).toEqual(["a", "b"]);
  });

  it("does not mutate its input", () => {
    const input = [
      { date: "2026-01-01", slug: "old" },
      { date: "2026-06-01", slug: "new" },
    ];
    sortByDateDesc(input);

    expect(slugsOf(input)).toEqual(["old", "new"]);
  });
});

describe("loadAllPosts", () => {
  it("excludes drafts but keeps planned placeholders when drafts are hidden", async () => {
    const posts = await loadAllPosts({ dir, includeDrafts: false });

    expect(slugsOf(posts)).toEqual(["a-planned", "newer-published", "older-published"]);
  });

  it("includes drafts when drafts are shown", async () => {
    const posts = await loadAllPosts({ dir, includeDrafts: true });

    expect(slugsOf(posts)).toContain("a-draft");
  });

  it("derives slug and reading time", async () => {
    const posts = await loadAllPosts({ dir, includeDrafts: false });
    const post = posts.find((candidate) => candidate.slug === "newer-published");

    expect(post?.readingTime).toMatch(/^\d+ min read$/);
  });

  it("applies frontmatter defaults", async () => {
    const posts = await loadAllPosts({ dir, includeDrafts: false });
    const post = posts.find((candidate) => candidate.slug === "older-published");

    expect(post?.goals).toEqual([]);
    expect(post?.projects).toEqual([]);
  });
});

describe("loadRoutablePosts", () => {
  it("excludes planned posts", async () => {
    const posts = await loadRoutablePosts({ dir, includeDrafts: true });

    expect(slugsOf(posts)).not.toContain("a-planned");
  });

  it("returns only published posts in a production build", async () => {
    const posts = await loadRoutablePosts({ dir, includeDrafts: false });

    expect(slugsOf(posts)).toEqual(["newer-published", "older-published"]);
  });
});

describe("loadPostBySlug", () => {
  it("returns the post with rendered html", async () => {
    const post = await loadPostBySlug("newer-published", { dir, includeDrafts: false });

    expect(post?.title).toBe("A newer published post");
    expect(post?.html).toContain("<h2");
  });

  it("returns null for an unknown slug", async () => {
    expect(await loadPostBySlug("does-not-exist", { dir })).toBeNull();
  });

  it("returns null for a planned post", async () => {
    expect(await loadPostBySlug("a-planned", { dir, includeDrafts: true })).toBeNull();
  });

  it("returns null for a draft when drafts are hidden", async () => {
    expect(await loadPostBySlug("a-draft", { dir, includeDrafts: false })).toBeNull();
  });

  it("returns a draft when drafts are shown", async () => {
    const post = await loadPostBySlug("a-draft", { dir, includeDrafts: true });

    expect(post?.slug).toBe("a-draft");
  });
});
