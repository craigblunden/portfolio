/**
 * Slug format shared with the API's SlugGenerator and enforced on frontmatter
 * references. Lowercase alphanumeric words joined by single hyphens.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Derives a post's URL slug from its filename. The filename is the single source
 * of truth for the URL, so a name that is not already a valid slug fails the build
 * rather than being silently normalised — normalising would produce a URL that no
 * longer matches the file it came from.
 */
export function slugFromFilename(filename: string): string {
  if (!filename.endsWith(".md")) {
    throw new Error(`Post "${filename}" must have a .md extension.`);
  }

  const slug = filename.slice(0, -".md".length);

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Post "${filename}" has an invalid slug "${slug}". ` +
        `Filenames must be lowercase kebab-case, e.g. "my-first-post.md".`,
    );
  }

  return slug;
}
