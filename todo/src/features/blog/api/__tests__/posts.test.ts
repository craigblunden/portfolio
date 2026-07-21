import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isListable,
  isRoutable,
  loadAllPosts,
  loadPostBySlug,
  loadPostMetaBySlug,
  loadRoutablePosts,
  sortByDateDesc,
} from "../posts";

const dir = path.join(__dirname, "fixtures");

const slugsOf = (posts: Array<{ slug: string }>) => posts.map((post) => post.slug);

describe("isRoutable", () => {
  it("routes published posts", () => {
    expect(isRoutable("published")).toBe(true);
  });

  // A planned post is a placeholder for something unwritten — it has no body, so a
  // page for it would be an empty page.
  it("never routes planned posts", () => {
    expect(isRoutable("planned")).toBe(false);
  });

  it("never routes drafts, in any environment", () => {
    expect(isRoutable("draft")).toBe(false);
  });
});

describe("isListable", () => {
  it("lists published and planned posts", () => {
    expect(isListable("published")).toBe(true);
    expect(isListable("planned")).toBe(true);
  });

  // Drafts are hidden everywhere rather than only in production, so what is visible
  // locally matches what ships.
  it("never lists drafts, in any environment", () => {
    expect(isListable("draft")).toBe(false);
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
  it("excludes drafts but keeps planned placeholders", async () => {
    const posts = await loadAllPosts({ dir });

    expect(slugsOf(posts)).toEqual(["a-planned", "newer-published", "older-published"]);
  });

  it("never includes drafts", async () => {
    const posts = await loadAllPosts({ dir });

    expect(slugsOf(posts)).not.toContain("a-draft");
  });

  it("derives slug and reading time", async () => {
    const posts = await loadAllPosts({ dir });
    const post = posts.find((candidate) => candidate.slug === "newer-published");

    expect(post?.readingTime).toMatch(/^\d+ min read$/);
  });

  it("applies frontmatter defaults", async () => {
    const posts = await loadAllPosts({ dir });
    const post = posts.find((candidate) => candidate.slug === "older-published");

    expect(post?.goals).toEqual([]);
    expect(post?.projects).toEqual([]);
  });
});

describe("loadRoutablePosts", () => {
  it("excludes planned posts", async () => {
    const posts = await loadRoutablePosts({ dir });

    expect(slugsOf(posts)).not.toContain("a-planned");
  });

  it("returns only published posts in a production build", async () => {
    const posts = await loadRoutablePosts({ dir });

    expect(slugsOf(posts)).toEqual(["newer-published", "older-published"]);
  });
});

describe("loadPostMetaBySlug", () => {
  // generateMetadata needs frontmatter but never the HTML, and rendering runs Shiki
  // over every code fence. Returning meta without html keeps that work off the path.
  it("returns metadata without rendering the body", async () => {
    const meta = await loadPostMetaBySlug("newer-published", { dir });

    expect(meta?.title).toBe("A newer published post");
    expect(meta).not.toHaveProperty("html");
  });

  it("applies the same routing rules as the full loader", async () => {
    expect(await loadPostMetaBySlug("a-planned", { dir })).toBeNull();
    expect(await loadPostMetaBySlug("a-draft", { dir })).toBeNull();
    expect(await loadPostMetaBySlug("does-not-exist", { dir })).toBeNull();
  });
});

describe("loadPostBySlug", () => {
  it("returns the post with rendered html", async () => {
    const post = await loadPostBySlug("newer-published", { dir });

    expect(post?.title).toBe("A newer published post");
    expect(post?.html).toContain("<h2");
  });

  it("returns null for an unknown slug", async () => {
    expect(await loadPostBySlug("does-not-exist", { dir })).toBeNull();
  });

  it("returns null for a planned post", async () => {
    expect(await loadPostBySlug("a-planned", { dir })).toBeNull();
  });

  it("returns null for a draft, so a draft URL 404s everywhere", async () => {
    expect(await loadPostBySlug("a-draft", { dir })).toBeNull();
  });
});
