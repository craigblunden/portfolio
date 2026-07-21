import { z } from "zod";
import { SLUG_PATTERN } from "./slug";

/** Frontmatter dates are plain calendar dates, e.g. 2026-07-21. */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const POST_STATUSES = ["published", "draft", "planned"] as const;

/** Meta descriptions are truncated by search engines around 160 characters. */
const DESCRIPTION_MAX = 200;

const slugList = (field: string) =>
  z
    .array(
      z
        .string()
        .regex(
          SLUG_PATTERN,
          `Each ${field} entry must be lowercase kebab-case, e.g. "portfolio-dashboard".`,
        ),
    )
    .default([]);

const frontmatterSchema = z
  .object({
    title: z.string().min(1, "Title is required."),
    description: z
      .string()
      .min(1, "Description is required — it is used as both meta description and card excerpt.")
      .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer.`),
    date: z.string().regex(ISO_DATE_PATTERN, "Date must be in YYYY-MM-DD format."),
    updated: z
      .string()
      .regex(ISO_DATE_PATTERN, "Updated must be in YYYY-MM-DD format.")
      .optional(),
    status: z.enum(POST_STATUSES),
    tags: z.array(z.string().min(1)).default([]),
    goals: slugList("goals"),
    projects: slugList("projects"),
  })
  // Strict: a typo like `tag:` instead of `tags:` should fail the build loudly rather
  // than silently resolving to an empty array. Adding a new field means updating this
  // schema first, which is the intended trade.
  .strict();

/**
 * The schema is the source of truth for this type — there is no separately
 * maintained interface to drift out of sync with the validation.
 */
export type Frontmatter = z.infer<typeof frontmatterSchema>;

function formatIssues(error: z.ZodError, filename: string): string {
  const issues = error.issues.map((issue) => {
    const field = issue.path.join(".") || "(root)";
    return `  ${field}: ${issue.message}`;
  });

  return [`Invalid frontmatter in content/blog/${filename}`, ...issues].join("\n");
}

/**
 * Validates one post's frontmatter, throwing with the filename and every failing
 * field. Thrown during the build so a malformed post stops the deploy rather than
 * rendering broken.
 */
export function parseFrontmatter(data: unknown, filename: string): Frontmatter {
  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(formatIssues(result.error, filename));
  }

  return result.data;
}
