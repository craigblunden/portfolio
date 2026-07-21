import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PostMeta, PostStatus } from "@/features/blog/api/posts";
import { PostCard } from "../PostCard";

afterEach(cleanup);

const post = (status: PostStatus = "published"): PostMeta => ({
  slug: "a-post",
  title: "A post title",
  description: "What the post is about.",
  date: "2026-07-21",
  status,
  tags: ["testing"],
  goals: [],
  projects: [],
  readingTime: "3 min read",
});

describe("PostCard", () => {
  it("renders the title and description", () => {
    render(<PostCard post={post()} />);

    expect(screen.getByText("A post title")).toBeTruthy();
    expect(screen.getByText("What the post is about.")).toBeTruthy();
  });

  it("links a published post to its page", () => {
    render(<PostCard post={post()} />);

    expect(screen.getByRole("link").getAttribute("href")).toBe("/blog/a-post");
  });

  // Planned posts are placeholders for unwritten articles; they have no route.
  it("does not link a planned post", () => {
    render(<PostCard post={post("planned")} />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("A post title")).toBeTruthy();
  });

  it("shows a status badge for a post that is not published", () => {
    render(<PostCard post={post("planned")} />);

    expect(screen.getByText("planned")).toBeTruthy();
  });

  it("shows no status badge for a published post", () => {
    render(<PostCard post={post()} />);

    expect(screen.queryByText("published")).toBeNull();
  });

  it("shows reading time and tags", () => {
    render(<PostCard post={post()} />);

    expect(screen.getByText("3 min read")).toBeTruthy();
    expect(screen.getByText("#testing")).toBeTruthy();
  });
});
