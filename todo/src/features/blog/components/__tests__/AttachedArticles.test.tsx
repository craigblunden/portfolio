import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PostMeta, PostStatus } from "@/features/blog/api/posts";
import { AttachedArticles } from "../AttachedArticles";

// Vitest is not configured with globals, so Testing Library's automatic cleanup is
// not registered. Without this, DOM from one test leaks into the next.
afterEach(cleanup);

const post = (slug: string, status: PostStatus = "published"): PostMeta => ({
  slug,
  title: `Title of ${slug}`,
  description: "A description.",
  date: "2026-07-21",
  status,
  tags: [],
  goals: [],
  projects: [],
  readingTime: "3 min read",
});

describe("AttachedArticles", () => {
  it("renders nothing when there are no articles, which is the common case", () => {
    const { container } = render(<AttachedArticles posts={[]} />);

    expect(container.innerHTML).toBe("");
  });

  it("links each article that has a page", () => {
    render(<AttachedArticles posts={[post("first"), post("second")]} />);

    expect(screen.getByRole("link", { name: /Title of first/ }).getAttribute("href")).toBe(
      "/blog/first",
    );
    expect(screen.getByRole("link", { name: /Title of second/ }).getAttribute("href")).toBe(
      "/blog/second",
    );
  });

  // A planned post is an unwritten placeholder with no route, so linking one is a
  // guaranteed 404. This is the bug this component shipped with.
  it("does not link a planned article", () => {
    render(<AttachedArticles posts={[post("planned-one", "planned")]} />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("does not link a draft either", () => {
    render(<AttachedArticles posts={[post("a-draft", "draft")]} />);

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders nothing at all when no attached article is linkable", () => {
    const { container } = render(
      <AttachedArticles posts={[post("a", "planned"), post("b", "draft")]} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("keeps linkable articles when unlinkable ones are mixed in", () => {
    render(<AttachedArticles posts={[post("planned-one", "planned"), post("written")]} />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/blog/written");
  });

  it("counts only the articles it actually shows", () => {
    render(<AttachedArticles posts={[post("planned-one", "planned"), post("written")]} />);

    expect(screen.getByText("[1]")).toBeTruthy();
  });
});
