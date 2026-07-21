import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../markdown";

// Assertions are deliberately loose. Pinning exact HTML would break on any harmless
// plugin upgrade; these check the capabilities the posts actually rely on.
describe("renderMarkdown", () => {
  it("renders paragraphs", async () => {
    expect(await renderMarkdown("Hello world.")).toContain("<p>Hello world.</p>");
  });

  it("gives headings a stable id for deep linking", async () => {
    const html = await renderMarkdown("## What actually happens");

    expect(html).toContain('id="what-actually-happens"');
  });

  it("appends an accessible anchor link to headings", async () => {
    const html = await renderMarkdown("## A heading");

    expect(html).toContain('href="#a-heading"');
    expect(html).toContain("aria-label");
  });

  it("renders GFM tables", async () => {
    const html = await renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");

    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders GFM task lists", async () => {
    const html = await renderMarkdown("- [x] done\n- [ ] todo");

    expect(html).toContain('type="checkbox"');
  });

  it("renders links", async () => {
    const html = await renderMarkdown("[docs](https://example.com)");

    expect(html).toContain('href="https://example.com"');
  });

  it("syntax-highlights fenced code", async () => {
    const html = await renderMarkdown('```ts\nconst x: number = 1;\n```');

    expect(html).toContain("<pre");
    // Shiki emits per-token spans with inline colours; plain <code> would not.
    expect(html).toContain("<span");
    expect(html).toContain("color:");
  });

  it("handles a code fence with no language", async () => {
    const html = await renderMarkdown("```\nplain text\n```");

    expect(html).toContain("<pre");
  });

  it("does not pass raw HTML through", async () => {
    const html = await renderMarkdown("<script>alert(1)</script>");

    expect(html).not.toContain("<script>");
  });
});
