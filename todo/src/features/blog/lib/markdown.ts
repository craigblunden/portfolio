import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/** VS Code's Dark+ — matches the editor aesthetic the rest of the site uses. */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: "dark-plus",
  keepBackground: false,
  defaultLang: "text",
};

/**
 * Renders post markdown to an HTML string.
 *
 * Runs at build time only. Raw HTML in markdown is not passed through, so the
 * output cannot contain markup the author did not intend via remark-rehype.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: "heading-anchor",
        ariaLabel: "Link to this section",
      },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
