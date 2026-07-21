/**
 * Renders post HTML produced at build time by the markdown pipeline.
 *
 * dangerouslySetInnerHTML is safe here only because the content is repo-committed
 * markdown rendered without raw HTML pass-through. If posts ever become
 * user-submitted, this must be revisited.
 */
export function PostBody({ html }: { html: string }) {
  return <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
