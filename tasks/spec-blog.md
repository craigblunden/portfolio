# Spec: Markdown Blog / Learning Log

**Status:** Draft — awaiting review
**Author:** Craig Blunden
**Created:** 2026-07-21

---

## Assumptions

These were confirmed during scoping. Listed so future readers know what was deliberate:

1. Posts are **files in the repo**, authored in an editor and committed via git — not rows in the .NET API, and not authored through the admin UI. (Goals gain a `Slug` column so posts can *reference* them, but posts themselves never enter the database.)
2. The blog is **single-author**. No author field, no bylines, no per-author archive pages.
3. Content is **plain markdown**, not MDX. No React components inside posts.
4. Posts are rendered at **build time** (SSG). Nothing reads the filesystem at request time.
5. The existing homepage "articles" column keeps its current look and position; only its data source changes.
6. English only. No i18n, no localised routes.
7. No comments, no reactions, no view counters, no newsletter capture in this pass.

---

## Objective

Craig writes markdown articles documenting engineering and career learnings. Today the homepage "articles" column is fed by three hardcoded placeholder objects in `blogsData.ts` with no actual article behind them. This feature makes those articles real.

**User stories:**

- *As the author*, I add a `.md` file to `content/blog/`, commit it, and it appears on the site — no database write, no admin form, no deploy step beyond the normal build.
- *As the author*, I mark a post as attached to a goal or project, and it surfaces on that goal's drawer and that project's card without me editing either.
- *As the author*, I can commit a half-finished post and see it locally while it stays invisible in production.
- *As a visitor (recruiter, hiring manager, peer)*, I browse `/blog` to see what Craig has been learning, and open any article at a clean shareable URL.
- *As a visitor sharing a link*, pasting `/blog/<slug>` into Slack or LinkedIn produces a title, description, and image rather than a bare URL.

**Why it matters:** the site's pitch is "building in public" during a job search. An articles column with three unwritten placeholders currently undercuts that claim. Real posts are the proof.

---

## Tech Stack

Existing (unchanged):

- Next.js `16.2.6` (App Router), React `19.2.4`, TypeScript `5.9.3`
- Tailwind CSS `4.3.0`, shadcn/ui, `lucide-react`
- Zod `4.4.3` — reused here for frontmatter validation
- Vitest `4.1.10` + jsdom, `@testing-library/react`

New dependencies (**requires approval — see Boundaries**):

| Package | Purpose |
|---|---|
| `gray-matter` | Split YAML frontmatter from markdown body |
| `unified` | Pipeline runner for the transforms below |
| `remark-parse` | Markdown → mdast |
| `remark-gfm` | Tables, strikethrough, task lists, autolinks |
| `remark-rehype` | mdast → hast |
| `rehype-slug` | Stable `id` on every heading |
| `rehype-autolink-headings` | Anchor links on headings |
| `rehype-pretty-code` | Shiki-based build-time syntax highlighting |
| `rehype-stringify` | hast → HTML string |

All are build-time only and add nothing to the client bundle — the pipeline runs in server components during `next build`, and the browser receives plain HTML.

Backend (ASP.NET Core 10, EF Core, SQLite):

- `Goal` gains a required `Slug` column with a unique index, so posts reference goals by stable human-readable key rather than an ambiguous numeric id.

New test project `api/api.Tests/`:

| Package | Purpose |
|---|---|
| `xunit.v3` | Test framework — current xUnit line |
| `xunit.runner.visualstudio` | Test discovery for `dotnet test` and IDEs |
| `Microsoft.NET.Test.Sdk` | Test host |
| `Microsoft.AspNetCore.Mvc.Testing` | `WebApplicationFactory` for endpoint tests |
| `Microsoft.EntityFrameworkCore.Sqlite` | SQLite in-memory for repository tests |
| `NSubstitute` | Interface substitutes for service-layer tests |

**Deliberately not used:**

- **`FluentAssertions`** — v8+ moved to a commercial licence requiring paid seats above a revenue threshold. Built-in `Assert` is used instead; `Shouldly` (MIT) is the fallback if fluent syntax is later wanted.
- **`Microsoft.EntityFrameworkCore.InMemory`** — it does not enforce unique indexes, so every duplicate-slug test would pass against it while production throws. SQLite in-memory is a real relational engine and catches the constraint this feature depends on. Microsoft's own guidance discourages InMemory for relational testing.
- **`Moq`** — avoided over the SponsorLink telemetry episode; NSubstitute is equivalent and uncontroversial.

---

## Commands

Run from `todo/`:

```sh
pnpm install                          # after dependencies are approved and added
pnpm dev                              # dev server at http://localhost:3000 (drafts visible)
pnpm build                            # production build — statically generates every post
pnpm start                            # serve the production build locally
pnpm lint                             # eslint
pnpm typecheck                        # tsc --noEmit
pnpm test                             # vitest (watch)
pnpm test --run                       # vitest single pass, for CI and pre-commit
pnpm test --run src/features/blog     # blog tests only
```

Verifying the standalone build actually ships (see Risks):

```sh
pnpm build && pnpm start              # then load /blog and /blog/<slug>
```

Backend, run from `api/api/`:

```sh
dotnet build                                  # compile
dotnet run                                    # API at http://localhost:5189
dotnet ef migrations add AddGoalSlug          # create the slug migration
dotnet ef database update                     # apply it
dotnet ef migrations script                   # review generated SQL before applying
```

Backend tests, run from `api/`:

```sh
dotnet test                                   # whole solution
dotnet test --filter FullyQualifiedName~SlugGenerator
dotnet test --logger "console;verbosity=detailed"
```

---

## Project Structure

```
todo/
  content/
    blog/
      <slug>.md                       → One file per article. Filename IS the URL slug.
  src/
    features/
      blog/
        api/
          posts.ts                    → loadAllPosts(), loadPostBySlug(), Post types
        lib/
          frontmatter.ts              → Zod schema + parse/validate with file-scoped errors
          markdown.ts                 → unified pipeline: markdown string → HTML string
          slug.ts                     → filename ⇄ slug derivation
          readingTime.ts              → word count → "6 min read"
          attachments.ts              → resolve goalIds / project slugs, reverse lookup
          __tests__/
            frontmatter.test.ts
            slug.test.ts
            readingTime.test.ts
            attachments.test.ts
            posts.test.ts
        components/
          PostCard.tsx                → Index + homepage card (reuses existing card styling)
          PostList.tsx                → /blog index list
          PostBody.tsx                → Renders post HTML with prose styling
          PostMeta.tsx                → Date, reading time, tags, attachment chips
          AttachedArticles.tsx        → "Articles" section for goal drawer / project card
    app/
      blog/
        page.tsx                      → /blog index
        [slug]/
          page.tsx                    → /blog/<slug>, generateStaticParams + generateMetadata
          not-found.tsx               → 404 for unknown slugs
      sitemap.ts                      → Generated sitemap.xml
      robots.ts                       → Generated robots.txt
```

**Backend files (`api/api/`):**

```
Models/GoalModel.cs                   → + required Slug property
DTOs/GoalDto.cs                       → GoalResponseDto + Slug; GoalRequestCreateDto + optional Slug
Services/GoalService.cs               → derive + collision-suffix slug on create, map Slug in ToResponse
Services/SlugGenerator.cs             → NEW: Slugify(name) + EnsureUnique(slug, existing)
Repositories/IGoalRepository.cs       → + SlugExistsAsync(slug)
Repositories/GoalRepository.cs        → implement SlugExistsAsync
Data/AppDbContext.cs                  → unique index on Goal.Slug
Migrations/<ts>_AddGoalSlug.cs        → NEW: add column, backfill, unique index
Program.cs                            → + public partial class Program {} (for WebApplicationFactory)
```

**Backend test project (`api/`):**

```
portfolio-api.sln                     → NEW: so dotnet test can discover projects
api.Tests/
  api.Tests.csproj                    → references api.csproj
  Services/
    SlugGeneratorTests.cs             → Tier 1: pure slug logic
    GoalServiceTests.cs               → Tier 2: NSubstitute over IGoalRepository
  Repositories/
    GoalRepositoryTests.cs            → Tier 3: SQLite in-memory, real constraints
  Integration/
    GoalsEndpointTests.cs             → Tier 4: WebApplicationFactory smoke test
  Infrastructure/
    SqliteInMemoryFixture.cs          → opens/holds a :memory: connection, migrates
    TestWebApplicationFactory.cs      → overrides DbContext + config for the host
```

**Frontend files modified, not created:**

- `src/features/dashboard/data/blogsData.ts` — **deleted**. Its `BlogStatus` type moves to `features/blog/api/posts.ts`; its three placeholder entries become real `.md` files with `status: planned`.
- `src/features/goals/api/goals.ts` — `Goal` type gains `slug: string`.
- `src/features/dashboard/data/dashboardData.ts` — fixture goals gain `slug` values.
- `src/features/dashboard/data/projectsData.ts` — each project gains a required `slug: string`.
- `src/features/dashboard/components/DashboardPage.tsx` — articles column reads `loadAllPosts()`; project cards gain an attached-articles link.
- `src/features/dashboard/components/GoalDrawer.tsx` — gains an attached-articles section.
- `src/components/common/EditorTabsNav.tsx` — new `blog.md` tab.
- `src/app/layout.tsx` — replace the placeholder `"Create Next App"` metadata with real site metadata and `metadataBase`.

---

## Content Format

### Frontmatter schema

```yaml
---
title: "Refactoring a todo app into a personal operating system"
description: "Notes on reshaping a CRUD app into something that communicates product thinking and engineering taste."
date: 2026-07-21
updated: 2026-07-24          # optional
status: published            # published | draft | planned
tags: [engineering, nextjs]  # optional, default []
goals: [land-next-senior-role]    # optional, default [] — matches Goal.Slug
projects: [portfolio-dashboard]   # optional, default [] — matches Project.slug
---

Body markdown starts here.
```

- **`title`** — required, non-empty. Used as `<h1>`, `<title>`, and OG title.
- **`description`** — required, non-empty, ≤ 200 chars. Doubles as the card excerpt and the meta description. One field, not two, so they can't drift.
- **`date`** — required, ISO `YYYY-MM-DD`. Drives index ordering (newest first).
- **`updated`** — optional. When present, shown as "updated <date>" and used for sitemap `lastModified`.
- **`status`** — required. Governs routing, visibility, and sitemap inclusion (table below).
- **`tags`**, **`goals`**, **`projects`** — optional arrays, default `[]`. `goals` and `projects` hold lowercase-kebab slugs, never numeric ids.

### Attachment cardinality

The relationship is **optional in both directions**, and the UI must treat that as the normal case rather than an edge case:

- A goal may have **zero, one, or many** articles. Most goals will have none.
- A project may have **zero, one, or many** articles.
- An article may attach to **zero, one, or many** goals and projects.

Concretely this means:

- The attachment section on a goal or project renders **only when at least one article exists**. No empty state, no "no articles yet" placeholder, no dashed outline — a goal without writing should look exactly as it does today.
- Nothing warns, lints, or nags about goals lacking articles. Absence is not a defect.
- The framing is a lightweight *"Read more"* affordance, not a content section with a heading and chrome.

This also justifies the warn-don't-fail stance on unresolvable goal slugs below: attachments are a supplementary link, not load-bearing data. A missing one degrades gracefully to the page as it exists today.

There is deliberately **no `slug` field**. The slug is derived from the filename: `refactoring-a-todo-app.md` → `/blog/refactoring-a-todo-app`. One source of truth, and the URL is discoverable by listing the directory.

### Status behaviour

| `status` | `/blog` index | `/blog/<slug>` route | Homepage column | Sitemap |
|---|---|---|---|---|
| `published` | yes | yes | yes, clickable | yes |
| `draft` | dev only | dev only | dev only, clickable | no |
| `planned` | no | **never** | yes, not clickable | no |

`planned` posts are placeholder cards for articles not yet written — the current `blogsData.ts` behaviour, preserved. They need only frontmatter; the body may be empty.

### Validation

Frontmatter is parsed with Zod at build time. A malformed or missing required field **fails the build** with the offending filename in the message — a broken post should never reach production silently.

```
✗ content/blog/my-post.md
  description: String must contain at most 200 character(s)
  date: Invalid date format, expected YYYY-MM-DD
```

Referential validation is asymmetric, and this is intentional:

- **`projects`** entries are validated against `projectsData.ts` at build time. An unknown slug **fails the build** — the data is static and always available, so there is no excuse for a dangling reference.
- **`goals`** entries are validated **only when the API is reachable** during the build. Goals live in the .NET API, which the frontend build already tolerates being down ([DashboardPage.tsx](../todo/src/features/dashboard/components/DashboardPage.tsx) wraps its fetch in a try/catch and falls back to fixtures). Making a dangling goal slug fatal would mean an API outage breaks the frontend build — a worse failure than a missing link.

  Behaviour: API reachable and slug unknown → **build warning**, attachment skipped. API unreachable → validation skipped entirely, one warning logged for the whole build.

Slug format is enforced on both: `^[a-z0-9]+(?:-[a-z0-9]+)*$`. A slug with uppercase, spaces, or underscores fails the build regardless of whether it resolves — that is a static string check needing no external data.

---

## Code Style

Match the existing codebase: double quotes, semicolons, `type` aliases over `interface`, `@/` path aliases, arrow functions for the api layer, function declarations for components, Tailwind utilities inline with no CSS modules.

```ts
// src/features/blog/api/posts.ts
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parseFrontmatter } from "@/features/blog/lib/frontmatter";
import { renderMarkdown } from "@/features/blog/lib/markdown";
import { slugFromFilename } from "@/features/blog/lib/slug";
import { getReadingTime } from "@/features/blog/lib/readingTime";

export type PostStatus = "published" | "draft" | "planned";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  status: PostStatus;
  tags: string[];
  goals: string[];
  projects: string[];
  readingTime: string;
};

export type Post = PostMeta & {
  html: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/* Drafts are authorable locally but must never reach a production build. */
const isVisible = (status: PostStatus) =>
  status === "published" ||
  (status === "draft" && process.env.NODE_ENV === "development");

export const loadAllPosts = async (): Promise<PostMeta[]> => {
  const filenames = (await readdir(BLOG_DIR)).filter((name) =>
    name.endsWith(".md"),
  );

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const raw = await readFile(path.join(BLOG_DIR, filename), "utf8");
      const { data, content } = matter(raw);

      return {
        ...parseFrontmatter(data, filename),
        slug: slugFromFilename(filename),
        readingTime: getReadingTime(content),
      };
    }),
  );

  return posts
    .filter((post) => post.status !== "draft" || isVisible(post.status))
    .sort((a, b) => b.date.localeCompare(a.date));
};
```

```tsx
// src/app/blog/[slug]/page.tsx — routing shape
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await loadRoutablePosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
    twitter: { card: "summary_large_image" },
  };
}
```

Backend slug generation lives in the service layer, matching how `GoalService` already owns DTO↔entity mapping:

```csharp
// api/api/Services/SlugGenerator.cs
public static class SlugGenerator
{
    public static string Slugify(string name)
    {
        var normalised = name.ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var stripped = new string(
            normalised.Where(c => CharUnicodeInfo.GetUnicodeCategory(c)
                != UnicodeCategory.NonSpacingMark).ToArray()
        );

        var slug = Regex.Replace(stripped, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');

        return string.IsNullOrEmpty(slug) ? "goal" : slug;
    }

    /* Slugs are referenced from committed markdown, so they must never
       collide — suffix until free rather than overwriting. */
    public static async Task<string> EnsureUniqueAsync(
        string slug,
        Func<string, Task<bool>> exists)
    {
        if (!await exists(slug)) return slug;

        for (var suffix = 2; ; suffix++)
        {
            var candidate = $"{slug}-{suffix}";
            if (!await exists(candidate)) return candidate;
        }
    }
}
```

**Conventions specific to this feature:**

- Goal slugs are **immutable once assigned**. Renaming a goal does not regenerate its slug — committed markdown references it. Changing a slug is a manual, deliberate act requiring a matching content edit.

- Everything under `features/blog/api` and `features/blog/lib` is **server-only**. No `"use client"` anywhere in the loading path — `node:fs` must never be reachable from a client component.
- Rendered post HTML is trusted (it is our own committed content) and injected with `dangerouslySetInnerHTML`. This is safe *only* because content is repo-authored; if content ever becomes user-submitted, this decision must be revisited.
- Prose styling is hand-rolled against the existing design tokens rather than adding `@tailwindcss/typography` — one fewer dependency, and the site's mono/editor aesthetic doesn't match the plugin's defaults.

---

## Testing Strategy

Vitest with jsdom, tests colocated in `__tests__/` beside the code under test — matching `features/goals/lib/__tests__/goalProgress.test.ts`.

**Unit tests (the bulk — pure functions, no filesystem):**

- `frontmatter.test.ts` — valid frontmatter parses; each required field missing produces an error naming the file; `description` over 200 chars rejected; bad date format rejected; optional arrays default to `[]`; unknown `status` rejected.
- `slug.test.ts` — `my-post.md` → `my-post`; non-`.md` rejected; uppercase and spaces rejected (slugs must be lowercase-kebab).
- `readingTime.test.ts` — word count → minutes; empty content → `"1 min read"`; code fences don't inflate the count.
- `attachments.test.ts` — posts group correctly by goal slug and project slug; a post attached to two goals appears under both; unknown goal slug is skipped with a warning, not a throw; unknown project slug throws; malformed slug (uppercase, spaces) throws regardless of resolution.
- `posts.test.ts` — status filtering: `planned` never routable; `draft` visible when `NODE_ENV=development` and absent otherwise; posts sort newest-first; ties broken deterministically.

**Component tests (light, matching existing thin convention):**

- `PostCard` renders title, description, and status badge; renders as a link when routable and a plain element when `planned`.

**Backend tests:**

The API currently has no test project. This feature stands one up at `api/api.Tests/`, scoped to the goal/slug path it touches. Existing untested code (Todos, Auth) stays untested here — the harness makes adding it cheap later, and widening scope now would bury the feature.

A solution file is required first: `dotnet test` has nothing to discover without one, since `api/` holds bare projects today.

Test naming: `Method_Scenario_ExpectedResult`. One assert concept per test.

**Tier 1 — `SlugGeneratorTests` (pure functions, no I/O).** The bulk of the value, driven by `[Theory]`/`[InlineData]`:

| Input | Expected slug |
|---|---|
| `Land the next senior engineering role` | `land-the-next-senior-engineering-role` |
| `Keep a steady reading habit` | `keep-a-steady-reading-habit` |
| `C# & .NET: deep dive!` | `c-net-deep-dive` |
| `Café résumé` | `cafe-resume` |
| `  leading and trailing  ` | `leading-and-trailing` |
| `multiple   inner   spaces` | `multiple-inner-spaces` |
| `already-kebab-case` | `already-kebab-case` |
| `!!!` | `goal` |
| `""` | `goal` |

Plus `EnsureUniqueAsync`: free slug returned unchanged; one collision → `-2`; consecutive collisions → `-3`; every output matches the slug format regex.

**Tier 2 — `GoalServiceTests` (NSubstitute over `IGoalRepository`).** Create derives a slug from `Name` when none is supplied; an explicitly supplied slug is honoured; a colliding slug is suffixed; `ToResponse` maps `Slug` onto the DTO; paging metadata is correct at boundaries (empty set, exact multiple of `limit`, partial final page).

**Tier 3 — `GoalRepositoryTests` (SQLite in-memory).** Uses a real relational engine so constraints actually apply:

- Inserting a duplicate slug **throws** — the test that proves the unique index exists, and the one EF InMemory would wrongly pass.
- `SlugExistsAsync` returns true/false correctly and is case-sensitive in the way the index is.
- `GetAllAsync` paging returns the right rows and includes `Todos`.
- **Migrations apply cleanly to an empty database** — catches a malformed `AddGoalSlug` before it reaches the dev DB.

**Tier 4 — `GoalsEndpointTests` (`WebApplicationFactory`).** One thin smoke test, not a second copy of the service tests: `GET /api/goals` returns 200 with `slug` present on every goal, and `POST /api/goals` unauthenticated returns 401. Requires `public partial class Program { }` appended to `Program.cs`, and the factory must override the DbContext registration and supply config — `Program.cs` runs `MigrateAsync()` at startup and reads Google auth settings, so an unconfigured host will not boot.

Frontend and backend suites run independently; there is no combined command.

**Not unit tested — verified by build:**

- The unified/rehype pipeline output. Asserting on generated HTML strings is brittle; a successful `pnpm build` plus a manual read of one rendered post is the check.

**Manual verification checklist before merge:**

1. `pnpm build && pnpm start`, then load `/blog` and one post — confirms standalone packaging works.
2. Confirm a `draft` post is absent from the production `/blog` index and returns 404 at its URL.
3. View source on a post: `<title>`, meta description, canonical, OG tags, and JSON-LD all present and correct.
4. `curl localhost:3000/sitemap.xml` — contains published posts only.
5. Open a goal drawer and a project card with attached articles; confirm they list.

---

## SEO

- **Per-post metadata** via `generateMetadata` — title, description, canonical URL, OpenGraph (`type: article`, `publishedTime`, `modifiedTime`), Twitter summary card.
- **`metadataBase`** set in the root layout from `NEXT_PUBLIC_SITE_URL` so canonical and OG URLs are absolute. **This is a new environment variable** and must be set in both `.env.local` and the deployment environment; without it canonical tags are relative and near-useless.
- **`app/sitemap.ts`** — published posts plus the static routes (`/`, `/resume`, `/blog`), using `updated ?? date` as `lastModified`.
- **`app/robots.ts`** — allow all, point at the sitemap, disallow `/admin`.
- **JSON-LD `BlogPosting`** per post: headline, description, `datePublished`, `dateModified`, author, canonical `mainEntityOfPage`.
- **Static OG image** shared across posts (`/public/imgs/og-default.png`). Per-post generated images were considered and deferred.
- **Semantic HTML** — one `<h1>` per post from the title, body headings starting at `<h2>`, `<time dateTime>` for dates, `<article>` wrapper.

---

## Accessibility

- Post body headings form a correct hierarchy — no skipped levels, `<h1>` never repeated.
- Heading anchor links from `rehype-autolink-headings` have accessible names, not bare `#`.
- Code blocks reach WCAG AA contrast in both light and dark themes; the Shiki theme is chosen against the existing tokens, not accepted by default.
- Post cards are wrapped in a single link with a discernible name — no nested interactive elements, no ambiguous "read more".
- `planned` cards are not focusable, since they go nowhere.

---

## Boundaries

**Always:**

- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test --run` before committing frontend changes, and `dotnet test` before committing backend changes.
- Use SQLite in-memory for any test asserting a database constraint — never the EF InMemory provider.
- Keep `features/blog/api` and `features/blog/lib` server-only.
- Fail the build loudly on invalid frontmatter rather than skipping the post.
- Update this spec first when a decision changes, then the code.

**Ask first:**

- Adding any dependency beyond those approved in the Tech Stack tables (nine frontend, six backend test).
- Any backend change *beyond* the `Goal.Slug` column, its migration, the test project, and the `public partial class Program` line — those are approved; a second schema change is not.
- Widening test scope to Todos or Auth. The harness is shared, but that is separate work.
- Changing `next.config.ts`, particularly `output: "standalone"`.
- Adding `@tailwindcss/typography` or any other Tailwind plugin.
- Changing the URL scheme after the first post ships — that breaks shared links.

**Never:**

- Author posts anywhere but `content/blog/`.
- Read the filesystem at request time.
- Commit a post containing secrets, unpublished employer detail, or anything naming a person without consent.
- Delete or weaken a failing test to make the build pass.
- Use `dangerouslySetInnerHTML` on anything that is not repo-committed markdown.

---

## Success Criteria

Each is independently checkable.

1. A new `content/blog/<slug>.md` with valid frontmatter and `status: published` appears at `/blog` and `/blog/<slug>` after `pnpm build`, with no other file edited.
2. `/blog` lists published posts newest-first, each showing title, description, date, reading time, and tags.
3. `/blog/<slug>` renders the markdown body with working GFM tables, task lists, and syntax-highlighted code fences.
4. An unknown slug returns 404 rather than a server error.
5. A `status: draft` post is visible in `pnpm dev` and is absent from the production index, its URL, and the sitemap.
6. A `status: planned` post renders as a non-clickable card on the homepage and has no route.
7. A post with `goals: [<slug>]` appears in that goal's drawer; a post with `projects: [<slug>]` appears on that project's card.
7a. A goal with **no** attached articles renders exactly as it does today — no heading, no empty state, no placeholder. Same for projects.
7b. A goal with **several** attached articles lists all of them.
8. Invalid frontmatter fails `pnpm build` with a message naming the file and the field.
9. An unknown project slug in `projects` fails the build; a malformed slug fails the build; an unknown *goal* slug warns without failing.
9a. `GET /api/goals` returns a `slug` on every goal, and every pre-existing goal row has a non-empty unique slug after migration.
9b. Creating a goal named `C# & .NET: deep dive!` yields slug `c-net-deep-dive`; creating a second goal with the same name yields `c-net-deep-dive-2`.
9c. The frontend build succeeds with the API stopped, falling back to fixtures and skipping goal-attachment resolution.
10. `sitemap.xml` and `robots.txt` are served and contain only published content.
11. Each post page carries a unique title, meta description, canonical URL, OG tags, and valid `BlogPosting` JSON-LD.
12. `pnpm build && pnpm start` serves posts correctly — proving standalone output includes what it needs.
13. `pnpm lint`, `pnpm typecheck`, and `pnpm test --run` all pass; `dotnet test` passes from `api/`.
13a. A `GoalRepositoryTests` case proves a duplicate slug insert throws — the unique index is real, not assumed.
14. `blogsData.ts` no longer exists and nothing imports it.
15. The homepage articles column looks unchanged apart from now linking to real posts.

---

## Risks

**1. `output: "standalone"` may not package `content/`.** — *Highest risk.*
Standalone builds copy only files Next's tracer can see. Because posts are read during SSG and baked into HTML, runtime file access shouldn't be needed — but any accidental dynamic path defeats this, and it fails *only in production*.
*Mitigation:* verify with `pnpm build && pnpm start` as a task-level gate, not at the end. If it fails, add `outputFileTracingIncludes` for `content/**` — a `next.config.ts` change, which is **ask first**.

**2. The `AddGoalSlug` backfill can fail on the unique index.**
Existing goal rows need slugs. SQLite offers only `lower()` and `replace()`, so an in-SQL slugify leaves punctuation intact and two names differing only by punctuation would produce duplicates — and the unique index creation then fails partway through the migration.
*Mitigation:* the migration runs in three explicit steps — add the column with a `''` default, backfill via `UPDATE`, then create the unique index. Inspect `dotnet ef migrations script` output and the existing rows *before* applying. The current dataset is two fixture-scale goals, so this is a quick eyeball. Backfilled slugs are then manually reviewed and corrected to read well, since SQL slugification is approximate. If a duplicate does appear, resolve it by hand before the index step.
*Rollback:* `dotnet ef database update <PreviousMigration>`.
*Additionally:* `GoalRepositoryTests` asserts migrations apply cleanly to an empty SQLite database, catching a malformed migration before it touches the dev DB.

**2b. `WebApplicationFactory` may not boot the host.**
`Program.cs` calls `MigrateAsync()` at startup and reads Google auth configuration. An unconfigured test host will throw before serving a request, and the failure looks like a test-infrastructure bug rather than a config one.
*Mitigation:* `TestWebApplicationFactory` replaces the `AppDbContext` registration with SQLite in-memory and supplies stub auth config. Tier 4 is deliberately one thin smoke test — if it fights back, the coverage it provides is already carried by Tiers 1–3, and it can be dropped without weakening the suite.

**3. Frontmatter dates and timezones.**
`new Date("2026-07-21")` parses as UTC midnight and can render as the previous day in negative-offset timezones.
*Mitigation:* treat dates as opaque strings for sorting (`localeCompare` on ISO strings sorts correctly) and format explicitly with `date-fns`, already a dependency. Covered by a test.

**4. Dependency count.**
Nine packages for what is "render some markdown" is a real cost.
*Mitigation:* all are build-time only and add nothing to the client bundle. If the count is unacceptable, the fallback is `remark` + `remark-html` alone, losing syntax highlighting and heading anchors.

**5. Slug permanence.**
Renaming a file after publishing breaks every shared link and the post's search ranking.
*Mitigation:* documented in Boundaries as ask-first. If a rename becomes necessary, it needs a redirect in `next.config.ts`.

---

## Open Questions

1. ~~**Site URL**~~ — **Resolved.** Likely `craigblunden.com`, currently a temporary domain. Hence `NEXT_PUBLIC_SITE_URL`: the domain is read from env at build time and hardcoded nowhere, so the eventual cutover is an env var change plus a rebuild. Local default is `http://localhost:3000`. **Consequence:** when the domain changes, canonical URLs and the sitemap change with it — search engines will re-index, and any absolute URL already shared points at the old host. If posts ship on the temporary domain, plan a 301 from old to new at cutover.
2. ~~**API test project**~~ — **Resolved.** Standing one up at `api/api.Tests/`, scoped to the goal/slug path. Extending coverage to Todos and Auth is follow-up work.
3. **Tag pages** — should `/blog/tags/<tag>` exist, or are tags display-only for now? Currently specced as display-only.
4. **RSS feed** — worth `/blog/rss.xml` in this pass, or defer? Cheap to add alongside the sitemap; currently out of scope.
5. **Existing placeholders** — should the three current `blogsData.ts` entries become real `planned` markdown files, or be dropped? Currently specced as migrated to `planned` files.
6. **Project attachment display** — project cards are compact. Should attached articles show as a full list, or a single "3 articles" link? Currently specced as a compact link row.
7. **Homepage column cap** — should the articles column cap at N posts with a "view all" link once there are more than a handful? Currently uncapped.

---

## Out of Scope

Comments, reactions, view counts, newsletter signup, full-text search, pagination on `/blog`, per-post generated OG images, MDX/interactive content, multi-author support, i18n, scheduled publishing, and any admin UI for authoring.
