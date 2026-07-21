# Implementation Plan: Markdown Blog / Learning Log

Spec: `tasks/spec-blog.md`

## Overview

Replace the hardcoded placeholder `blogsData.ts` with a real file-based blog: markdown
articles in `todo/content/blog/`, statically generated at build time, listed at `/blog`
and readable at `/blog/<slug>`. Posts attach to goals and projects via frontmatter slug
references, surfacing on the goal drawer and project cards. Goals gain a `Slug` column in
the .NET API so those references are stable and human-readable.

## Shape of the work

Two largely independent tracks that meet at integration:

```
TRACK A (backend)          TRACK B (frontend pipeline)
  A0 Solution + test proj    B1 Deps + first post
  A1 Slug model + generator  B2 Frontmatter/slug/readtime libs
  A2 Migration ⚠             B3 Markdown pipeline
  A3 API exposes slug        B4 Post loader
  A4 Repo + endpoint tests
        │                          │
        │                    C1 /blog/<slug> renders
        │                    C2 BUILD GATE ⚠⚠  ← hard stop
        │                    C3 /blog index
        │                    D1–D3 SEO
        └──────────┬───────────────┘
                   ▼
             E1 Slugs into frontend types
             E2 Attachment resolution
             E3 Surface on goals + projects
             E4 Homepage swap, delete blogsData
             E5 Nav tab
                   ▼
             F  Accessibility + full verification
```

Track A and Track B touch **no shared files** and can be built in either order or in
parallel. Everything from E onward is strictly sequential.

## Architecture Decisions

- **Filename is the slug.** No `slug:` frontmatter field — `my-post.md` → `/blog/my-post`.
  Two sources of truth for a URL will drift, and a typo'd slug orphans a post from the
  file defining it.
- **`status` drives everything.** The existing `published | draft | planned` union already
  in `blogsData.ts` governs routing, sitemap inclusion, and badge display from one field,
  rather than a parallel `draft: boolean`.
- **Build-time only.** Posts are read during SSG and baked into HTML. Nothing touches the
  filesystem at request time — this is what makes `output: "standalone"` safe.
- **Asymmetric reference validation.** Unknown *project* slug fails the build (static data,
  always available). Unknown *goal* slug only warns (the API may be down, and the frontend
  build already tolerates that). Making it fatal would let an API outage break the build.
- **Slug generation in the service layer.** `GoalService` already owns DTO↔entity mapping,
  and collision suffixing needs a repository read the model can't do.
- **SQLite in-memory, never EF InMemory.** The InMemory provider does not enforce unique
  indexes, so it would pass every duplicate-slug test while production throws. The whole
  point of the constraint is the thing InMemory cannot see.
- **Test infrastructure comes first (A0), not last.** Writing `SlugGenerator` against a
  runnable test project is faster than writing it blind and retrofitting tests, and it
  forces the solution-file and project-reference plumbing to be solved while the surface
  area is one class.
- **Goal slugs are immutable once assigned.** Committed markdown references them; renaming
  a goal must not silently regenerate its slug.
- **Hand-rolled prose styles.** No `@tailwindcss/typography` — one fewer dependency, and
  the plugin's defaults fight the site's mono/editor aesthetic.

## Ordering rationale

**The build gate (C2) is deliberately early.** The spec's top risk is `output: "standalone"`
failing to package `content/` — a failure appearing *only* in a production build. Finding
it after routes, SEO, and integration are done means unwinding architectural assumptions
across a dozen files. So the first thing after one post renders in dev is a full
`pnpm build && pnpm start`. If it fails there, the blast radius is four files.

**One post end-to-end before breadth (C1 before C3).** A single article at its own URL
exercises the whole pipeline: frontmatter → validation → markdown → HTML → route → SSG.
The index is a loop over machinery already proven. Building the index first means
debugging list rendering and content rendering simultaneously.

**Backend before E1, not before B.** The frontend pipeline has no dependency on goal slugs
until attachment resolution. Blocking markdown work behind an EF migration would serialise
two things that needn't be.

**Deleting `blogsData.ts` is last (E4), not first.** It currently feeds the live homepage
column. Removing it early leaves the homepage broken across every intermediate commit;
removing it once real posts load makes the swap atomic, so every commit ships something
working.

## Risk checkpoints

| # | Risk | Surfaces at | If it fails |
|---|---|---|---|
| ⚠⚠ | `standalone` omits `content/` | **C2** | Add `outputFileTracingIncludes` for `content/**` — a `next.config.ts` change, **ask first** |
| ⚠ | Backfill collides on unique index | **A2** | Resolve duplicate slugs by hand before the index step; `dotnet ef database update <prev>` to roll back |
| ⚠ | Shiki theme fails AA contrast | **F1** | Swap theme; do not ship failing contrast |
| ⚠ | `WebApplicationFactory` won't boot | **A4** | Host runs `MigrateAsync()` + reads auth config. Override both in the factory. If it resists, drop Tier 4 — Tiers 1–3 already cover the logic |
| — | Build breaks when API is down | **E2** | Goal-slug validation must warn, never throw — explicitly tested |

## Verification checkpoints

Between phases, not just at the end:

- **After A0** — `dotnet test` runs and discovers zero tests without error.
- **After A1** — `dotnet test` green on the full `SlugGenerator` table.
- **After A2** — `dotnet ef migrations script` reviewed by eye; every existing goal row has
  a unique non-empty slug.
- **After A3** — `curl localhost:5189/api/goals` shows `slug` on every goal.
- **After A4** — a duplicate-slug insert test fails when the unique index is removed. If it
  still passes, the test is not testing what it claims.
- **After C2** — `pnpm build && pnpm start`, load `/blog/<slug>` on the production server.
  **Do not proceed past a failure here.**
- **After D3** — view source: title, description, canonical, OG, JSON-LD present;
  `/sitemap.xml` lists published posts only.
- **After E4** — homepage articles column visually unchanged, now linking to real posts.
- **After F** — full manual checklist from the spec.

## Commit strategy

Branch `feature/blog` off `develop`. One commit per task, each independently building and
passing `pnpm lint && pnpm typecheck && pnpm test --run`. The migration (A2) commits
separately from its consumers (A3) so it can be reverted alone.

## Deferred

Tag pages, RSS, per-post OG images, an API test project, homepage post cap. All recorded in
the spec's Open Questions — none block this plan.
