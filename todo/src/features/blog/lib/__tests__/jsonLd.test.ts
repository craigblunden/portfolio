import { describe, expect, it } from "vitest";
import type { PostMeta } from "@/features/blog/api/posts";
import { postJsonLd, postJsonLdScript } from "../jsonLd";

const post = (overrides: Partial<PostMeta> = {}): PostMeta => ({
  slug: "a-post",
  title: "A post",
  description: "About something.",
  date: "2026-07-21",
  status: "published",
  tags: [],
  goals: [],
  projects: [],
  readingTime: "3 min read",
  ...overrides,
});

describe("postJsonLd", () => {
  it("describes the post as a BlogPosting", () => {
    const ld = postJsonLd(post());

    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("A post");
  });

  it("falls back to the publish date when the post was never updated", () => {
    expect(postJsonLd(post()).dateModified).toBe("2026-07-21");
  });

  it("uses the updated date when present", () => {
    expect(postJsonLd(post({ updated: "2026-07-24" })).dateModified).toBe("2026-07-24");
  });

  it("omits keywords when the post has no tags", () => {
    expect(postJsonLd(post()).keywords).toBeUndefined();
  });
});

describe("postJsonLdScript", () => {
  it("produces parseable JSON", () => {
    expect(JSON.parse(postJsonLdScript(post()))).toMatchObject({ headline: "A post" });
  });

  // Embedded in a <script> tag, an unescaped "</script>" in any field would close
  // the tag early and let the remainder render as markup.
  it("escapes angle brackets so a title cannot close the script tag", () => {
    const script = postJsonLdScript(
      post({ title: "Breaking out </script><script>alert(1)</script>" }),
    );

    expect(script).not.toContain("<");
    expect(script).not.toContain("</script>");
  });

  it("still round-trips an escaped title back to its original value", () => {
    const title = "Generics in C#: List<T> explained";
    const parsed = JSON.parse(postJsonLdScript(post({ title })));

    expect(parsed.headline).toBe(title);
  });

  it("escapes angle brackets appearing in the description", () => {
    const script = postJsonLdScript(post({ description: "Uses <div> elements." }));

    expect(script).not.toContain("<");
  });
});
