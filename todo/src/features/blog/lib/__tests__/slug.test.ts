import { describe, expect, it } from "vitest";
import { slugFromFilename } from "../slug";

describe("slugFromFilename", () => {
  it("strips the .md extension to produce the slug", () => {
    expect(slugFromFilename("sqlite-migrations-are-not-symmetric.md")).toBe(
      "sqlite-migrations-are-not-symmetric",
    );
  });

  it("accepts a single-word filename", () => {
    expect(slugFromFilename("hello.md")).toBe("hello");
  });

  it("accepts digits in the slug", () => {
    expect(slugFromFilename("lessons-from-2026.md")).toBe("lessons-from-2026");
  });

  it.each([
    ["a non-markdown extension", "my-post.txt"],
    ["no extension at all", "my-post"],
    ["an mdx extension", "my-post.mdx"],
  ])("rejects %s", (_label, filename) => {
    expect(() => slugFromFilename(filename)).toThrow(/\.md/);
  });

  // The slug is the public URL. A filename that is not already kebab-case would
  // produce a URL that does not match its file, so it fails loudly at build time
  // rather than being silently normalised.
  it.each([
    ["uppercase letters", "My-Post.md"],
    ["spaces", "my post.md"],
    ["underscores", "my_post.md"],
    ["a leading hyphen", "-my-post.md"],
    ["a trailing hyphen", "my-post-.md"],
    ["consecutive hyphens", "my--post.md"],
    ["an empty name", ".md"],
  ])("rejects %s", (_label, filename) => {
    expect(() => slugFromFilename(filename)).toThrow();
  });

  it("names the offending file in the error", () => {
    expect(() => slugFromFilename("My_Post.md")).toThrow(/My_Post\.md/);
  });
});
