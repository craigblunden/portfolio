# Todo: Markdown Blog / Learning Log

Spec: `tasks/spec-blog.md` · Plan: `tasks/plan-blog.md`

> **Status (2026-07-21):** **Feature complete** on `feature/blog`. Backend 47 tests,
> frontend 98 tests, typecheck / lint / production build all green. Remaining: manual
> browser review, and writing real content.

Frontend commands run from `todo/`, backend from `api/api/` (tests from `api/`).
Every frontend task must leave `pnpm lint`, `pnpm typecheck`, `pnpm test --run` green;
every backend task must leave `dotnet test` green.

---

## Track A: Backend goal slugs

*Independent of Track B — can run in parallel.*

- [x] **A0: Solution file and test project** — done, `f0b5792`
  - Acceptance: `api/portfolio-api.slnx` includes `api` and a new `api.Tests` project
    referencing it. `HarnessTests` proves discovery and the project reference both work.
  - Verify: `dotnet test` from `api/` — 1 passed. ✅
  - Files: `portfolio-api.slnx`, `api.Tests/api.Tests.csproj`, `api.Tests/HarnessTests.cs`,
    `api.Tests/.gitignore`

  **Deviations from plan, deliberate:**
  - **Only `xunit.v3` + runner installed**, not all six packages. NSubstitute, Mvc.Testing,
    and EFCore.Sqlite are added in A3/A4 when first used — installing unused dependencies
    up front is speculative.
  - **`public partial class Program { }` deferred to A4**, where `WebApplicationFactory`
    actually needs it. It is a production-file change and belongs in the commit that
    justifies it.
  - **Solution is `.slnx`, not `.sln`.** The .NET 10 SDK's `dotnet new sln` now emits the
    XML format by default. Fine for SDK-driven work; older Visual Studio versions may not
    open it.
  - **xUnit v2 → v3 conversion.** The `dotnet new xunit` template still scaffolds 2.9.3.
    v3 test projects are self-executing, hence `<OutputType>Exe</OutputType>`.
  - **Added `api.Tests/.gitignore`.** The existing ignore file is scoped to `api/api/`, so
    the new project's `bin`/`obj` were untracked-but-not-ignored.

- [x] **A1: Slug generator and model column, test-first** — done, `b391b91` + `5d25640`
  - Acceptance: `SlugGeneratorTests` covers the full spec table via `[Theory]`/`[InlineData]`
    — accents, punctuation, whitespace collapse, empty → `goal` — plus `EnsureUniqueAsync`
    returning free slugs unchanged and suffixing `-2`, `-3` on collision. `Goal` gains a
    required `Slug`; `AppDbContext` declares the unique index. No migration yet.
  - Verify: `dotnet test --filter FullyQualifiedName~SlugGenerator` green; `dotnet build`
    succeeds.
  - Files: `Models/GoalModel.cs`, `Data/AppDbContext.cs`, `Services/SlugGenerator.cs`,
    `api.Tests/Services/SlugGeneratorTests.cs`

- [x] **A2: Create and apply the `AddGoalSlug` migration** — done, `f7bc61d`
  - Acceptance: adds the column with a `''` default, then the unique index.
    **The backfill step was dropped** — production has no goal rows, so there is nothing to
    migrate. This removed the plan's second-highest risk entirely.
  - Verify: migration read in full before applying ✅; applied, rolled back, and re-applied
    against a local SQLite DB ✅.
  - Files: `Migrations/20260721074258_AddGoalSlug.cs` (+ Designer, snapshot)

  **Findings that revise the plan's risk table:**
  - **Up is transactional; Down is not.** SQLite has no real `DROP COLUMN`, so EF rebuilds
    the table and cannot wrap it in a transaction (`dotnet ef` emits 2 warnings on the down
    path, 0 on the up path). Applying fails atomically and safely; an interrupted *rollback*
    leaves partial state. **Prefer a forward fix over a rollback for this migration.**
  - If the target DB unexpectedly holds ≥2 goals, all rows default to `""`, the unique index
    fails, and the migration aborts cleanly — but since `Program.cs` migrates on startup,
    that surfaces as a failed boot rather than a quiet skip.
  - EF-generated migrations are **not** csharpier-formatted in this repo; left as generated.

- [x] **A3: Expose slug through the API** — done, `d820a6e`
  - **Decision:** a malformed supplied slug is *discarded* in favour of deriving from the
    name, not normalised. Validity is checked as `Slugify(x) == x`, reusing the covered
    function rather than adding a second regex that could drift from it. Pinned by
    `CreateAsync_MalformedSlugSupplied_FallsBackToNameRatherThanNormalising`.
  - Acceptance: `GoalResponseDto` carries `Slug`; `GoalRequestCreateDto` accepts an optional
    `Slug`, derived from `Name` when omitted; `CreateAsync` generates and de-duplicates via
    `SlugGenerator`; `IGoalRepository.SlugExistsAsync` implemented.
    `GoalServiceTests` (NSubstitute over `IGoalRepository`) covers slug derivation, explicit
    slug honoured, collision suffixing, `Slug` mapped onto the DTO, and paging metadata at
    boundaries — empty set, exact multiple of `limit`, partial final page.
  - Verify: `dotnet test` green. `curl localhost:5189/api/goals` returns `slug` on every
    goal. POST a goal named `C# & .NET: deep dive!` → `c-net-deep-dive`; POST it again →
    `c-net-deep-dive-2`.
  - Files: `DTOs/GoalDto.cs`, `Services/GoalService.cs`, `Repositories/IGoalRepository.cs`,
    `Repositories/GoalRepository.cs`, `api.Tests/Services/GoalServiceTests.cs`

- [x] **A4: Repository and endpoint tests** — done, `82fb63a` + `a91ead9`
  - **Mutation-checked:** flipping the migration's index to `unique: false` fails exactly
    one test, the duplicate-slug one. The constraint test genuinely tests the constraint.
  - **Endpoint tests kept**, not dropped — the host booted once the factory supplied dummy
    Google credentials and swapped the DbContext for SQLite in-memory.
  - **Finding:** unauthenticated `POST /api/goals` returns **302 (challenge to Google)**,
    not 401. `DefaultChallengeScheme` is Google, so the cookie handler's
    `OnRedirectToLogin` → 401 mapping never fires. A 302 to an OAuth page is a poor
    contract for an API consumed by a proxy — see Noticed But Not Touching.
  - **NSubstitute never needed.** `FakeGoalRepository` covered every service test, so the
    approved dependency was not installed. Real/fake beat a mock here.
  - Acceptance: `SqliteInMemoryFixture` opens and holds a `:memory:` connection and applies
    migrations. `GoalRepositoryTests` proves a duplicate slug insert **throws**, that
    `SlugExistsAsync` is correct, that paging returns the right rows with `Todos` included,
    and that migrations apply cleanly to an empty database. `GoalsEndpointTests` is one thin
    smoke test: `GET /api/goals` → 200 with `slug` on every goal; unauthenticated
    `POST /api/goals` → 401.
  - Verify: `dotnet test` green. Then **temporarily remove the unique index and confirm the
    duplicate-slug test fails** — if it still passes it is not testing what it claims.
    Restore the index.
  - Files: `api.Tests/Infrastructure/{SqliteInMemoryFixture,TestWebApplicationFactory}.cs`,
    `api.Tests/Repositories/GoalRepositoryTests.cs`,
    `api.Tests/Integration/GoalsEndpointTests.cs`
  - If `WebApplicationFactory` resists booting, drop the endpoint tests rather than sinking
    time — Tiers 1–3 already cover the logic. Note the drop here.

---

## Track B: Markdown pipeline

- [x] **B1: Add dependencies and the first real post**
  - Acceptance: the nine approved packages installed; `todo/content/blog/` exists with one
    genuine article (not lorem ipsum) containing headings, a code fence, a list, and a link,
    with complete valid frontmatter.
  - Verify: `pnpm install` clean; `pnpm build` still passes with the content unused.
  - Files: `package.json`, `content/blog/<slug>.md`

- [x] **B2: Frontmatter, slug, and reading-time libraries**
  - Acceptance: `slugFromFilename` rejects non-`.md` and non-kebab names; `getReadingTime`
    excludes code fences from word count; `parseFrontmatter` validates the full schema with
    Zod and throws errors naming file *and* field.
  - Verify: `pnpm test --run src/features/blog`
  - Files: `src/features/blog/lib/{slug,readingTime,frontmatter}.ts` + `__tests__/`
  - 🔵 **Human contribution point** — the frontmatter Zod schema. See note at the bottom.

- [x] **B3: Markdown rendering pipeline**
  - Acceptance: `renderMarkdown(md)` returns an HTML string via unified — GFM tables, task
    lists, heading ids, autolinked headings, and Shiki-highlighted code fences all working.
  - Verify: temporary script or test rendering the B1 post; inspect the HTML by eye.
  - Files: `src/features/blog/lib/markdown.ts`

- [x] **B4: Post loader**
  - Acceptance: `loadAllPosts()` returns sorted metadata (newest first, deterministic ties);
    `loadPostBySlug()` returns one post with rendered HTML; `planned` never routable;
    `draft` visible only when `NODE_ENV=development`.
  - Verify: `pnpm test --run src/features/blog` — status filtering and sort order covered.
  - Files: `src/features/blog/api/posts.ts` + `__tests__/posts.test.ts`

---

## Track C: Routes

- [x] **C1: Single post route**
  - Acceptance: `/blog/<slug>` renders title, date, reading time, tags, and body with prose
    styling built on existing design tokens. `generateStaticParams` covers routable posts;
    `dynamicParams = false`; unknown slug 404s.
  - Verify: `pnpm dev`, load the B1 post. Load a nonsense slug → 404.
  - Files: `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/not-found.tsx`,
    `src/features/blog/components/{PostBody,PostMeta}.tsx`

- [x] **C2: BUILD GATE — verify standalone output** ⚠⚠
  - Acceptance: a production build serves the post correctly.
  - Verify: `pnpm build && pnpm start`, load `/blog/<slug>`. Confirm the post HTML is
    generated at build time, not read at request time.
  - **Do not start C3 until this passes.** On failure, stop and raise the
    `outputFileTracingIncludes` change — it modifies `next.config.ts`, which is ask-first.
  - Files: none (verification only)

- [x] **C3: Blog index**
  - Acceptance: `/blog` lists routable posts newest-first with title, description, date,
    reading time, tags. `planned` posts excluded. Empty state handled.
  - Verify: `pnpm dev` → `/blog`. Add a second post, confirm ordering. Set one to `draft`,
    confirm it shows in dev and vanishes from `pnpm build && pnpm start`.
  - Files: `src/app/blog/page.tsx`, `src/features/blog/components/{PostCard,PostList}.tsx`

---

## Track D: SEO

- [x] **D1: Site URL and root metadata**
  - Acceptance: `NEXT_PUBLIC_SITE_URL` read into `metadataBase`, defaulting to
    `http://localhost:3000`. Root layout's placeholder `"Create Next App"` metadata replaced
    with real title/description. Domain hardcoded nowhere.
  - Verify: view source on `/` — correct title, absolute OG URLs.
  - Files: `src/app/layout.tsx`, `.env.local`, `todo/README.md`

- [x] **D2: Per-post metadata and structured data**
  - Acceptance: `generateMetadata` emits title, description, canonical, OG (`type: article`,
    `publishedTime`, `modifiedTime`), and Twitter card. Valid `BlogPosting` JSON-LD.
  - Verify: view source on a post; paste JSON-LD into a structured-data validator.
  - Files: `src/app/blog/[slug]/page.tsx`

- [x] **D3: Sitemap and robots**
  - Acceptance: `sitemap.xml` lists `/`, `/resume`, `/blog`, and published posts only, using
    `updated ?? date` as `lastModified`. `robots.txt` allows all, disallows `/admin`, points
    at the sitemap.
  - Verify: `pnpm build && pnpm start`, then `curl localhost:3000/sitemap.xml` and
    `/robots.txt`. Confirm no draft or planned post appears.
  - Files: `src/app/sitemap.ts`, `src/app/robots.ts`

---

## Track E: Integration

*Strictly sequential. E1 needs A3 and B4 complete.*

- [x] **E1: Slugs into frontend types**
  - Acceptance: `Goal` type gains `slug: string`; fixture goals in `dashboardData.ts` get
    slugs matching the migrated DB rows; `Project` type gains a required `slug`, with values
    added to both existing projects.
  - Verify: `pnpm typecheck` — every construction site updated.
  - Files: `src/features/goals/api/goals.ts`, `src/features/dashboard/data/dashboardData.ts`,
    `src/features/dashboard/data/projectsData.ts`

- [x] **E2: Attachment resolution**
  - Acceptance: `postsForGoal(slug)` / `postsForProject(slug)` group correctly; unknown
    project slug throws; unknown goal slug warns; malformed slug throws; API unreachable
    skips goal validation without failing.
  - Verify: `pnpm test --run src/features/blog`. Then **stop the API and run `pnpm build`** —
    it must succeed.
  - Files: `src/features/blog/lib/attachments.ts` + `__tests__/attachments.test.ts`

- [x] **E3: Surface attachments on goals and projects**
  - Acceptance: attachment is optional in both directions and **absence is the common case**.
    A goal or project with articles shows a lightweight "read more" affordance listing them;
    one without renders **byte-identically to today** — no heading, no empty state, no
    placeholder, no reserved space. Multiple articles all list.
  - Verify: `pnpm dev` with three fixtures — a goal with zero articles (unchanged from
    `develop`, confirm by screenshot diff or eye), one with a single article, one with two.
    Same for a project. Confirm links resolve.
  - Files: `src/features/blog/components/AttachedArticles.tsx`,
    `src/features/dashboard/components/{GoalDrawer,DashboardPage}.tsx`

- [x] **E4: Homepage swap and `blogsData.ts` removal**
  - Acceptance: the articles column reads `loadAllPosts()`; the three placeholder entries
    become real `.md` files with `status: planned`; `BlogStatus` type relocated;
    `blogsData.ts` deleted with no remaining imports.
  - Verify: `grep -r blogsData src/` returns nothing. `pnpm typecheck`. Homepage column looks
    unchanged but now links to real posts; planned cards remain non-clickable.
  - Files: `src/features/dashboard/components/DashboardPage.tsx`, `content/blog/*.md`,
    **deletes** `src/features/dashboard/data/blogsData.ts`

- [x] **E5: Navigation tab**
  - Acceptance: a `blog.md` tab sits between `home.tsx` and `resume.md`, active for
    `/blog` and `/blog/*`.
  - Verify: `pnpm dev` — active state correct on both index and post pages.
  - Files: `src/components/common/EditorTabsNav.tsx`

---

## Track F: Verification

- [ ] **F1: Accessibility pass**
  - Acceptance: correct heading hierarchy (one `<h1>`, body starts at `<h2>`); heading anchors
    have accessible names; code blocks meet AA contrast in both themes; post cards are a
    single link with a discernible name; `planned` cards not focusable.
  - Verify: keyboard-only navigation of `/blog` and a post; contrast checked on code blocks.
  - Files: as needed

- [ ] **F2: Full checklist**
  - Acceptance: all 15+ success criteria in the spec confirmed.
  - Verify: work the spec's manual checklist end to end against `pnpm build && pnpm start`.
  - Files: none — update this file's status line and record anything outstanding.

---

## ⚠️ Noticed but not touching — pre-existing, out of scope

Surfaced by `dotnet restore` during A0. Both predate this feature and are unrelated to it,
so they are recorded rather than fixed:

- **`SQLitePCLRaw.lib.e_sqlite3` 2.1.11 — known high-severity vulnerability**
  ([GHSA-2m69-gcr7-jv3q](https://github.com/advisories/GHSA-2m69-gcr7-jv3q)). Transitive via
  `Microsoft.EntityFrameworkCore.Sqlite`.
- **`Microsoft.OpenApi` 2.0.0 — known high-severity vulnerability**
  ([GHSA-v5pm-xwqc-g5wc](https://github.com/advisories/GHSA-v5pm-xwqc-g5wc)). Transitive via
  `Microsoft.AspNetCore.OpenApi`.

Both emit `NU1903` warnings on every build and will now also appear on every `dotnet test`
run. Worth a separate dependency-bump task — say the word and I'll raise one.

Also noted: `api.csproj` references `Microsoft.EntityFrameworkCore.Cosmos`, which nothing in
the codebase uses. Unrelated to this work.

**Unauthenticated API calls get a 302, not a 401.** Found by the A4 endpoint tests.
`DefaultChallengeScheme` is Google, so an unauthorised request is redirected to an OAuth
consent page rather than rejected. The cookie handler already maps this to 401 via
`OnRedirectToLogin`, but that only fires when cookies handle the challenge. For an API
behind a Next.js proxy, a 302 to accounts.google.com is a worse contract than a 401 — the
proxy cannot distinguish "not logged in" from a genuine redirect. Fixable by giving the
`AdminOnly` policy an explicit authentication scheme. Out of scope here; worth its own task.

**No `packageManager` field pins pnpm, and the versions disagree.** `todo/pnpm-lock.yaml` is
`lockfileVersion: '9.0'` (pnpm 9/10), but the pnpm on PATH here is **8.2.0**, which writes
`lockfileVersion: '6.0'`. Running `pnpm add` therefore silently **rewrote and downgraded the
entire lockfile**, dropping `@tailwindcss/oxide-win32-x64-msvc` and breaking `pnpm build`
with an error pointing at a native binding — three layers from the real cause.

Recovery: restore the lockfile from git, delete `node_modules`, reinstall with
`corepack pnpm@10.15.0`. **Fix worth making:** add `"packageManager": "pnpm@10.15.0"` to
`todo/package.json` so corepack pins it automatically and this cannot recur. Not done here —
it is a repo-wide toolchain change, not a blog-feature change.

**`api/dotnet-tools.json` is in the wrong place.** The manifest belongs at
`api/.config/dotnet-tools.json`; where it currently sits, `dotnet tool restore` will not
find it, so the pinned csharpier 1.2.6 is not actually restorable by a fresh clone. It only
worked here because csharpier is installed globally on this machine.

## 🔵 Human contribution point (B2)

The frontmatter Zod schema is where the strictness trade-offs live, and they're judgement
calls rather than defaults:

- Should unknown frontmatter keys be **rejected** (`.strict()`, catches typos like `tag:` for
  `tags:`) or **ignored** (lenient, allows future fields without a code change)?
- Is a 200-char `description` ceiling right? Google truncates around 155–160, but the same
  field is the homepage card excerpt.
- Should `date` in the future be rejected, or allowed for scheduled-ish posts?

A `TODO(human)` will be placed in `frontmatter.ts` when B2 is reached.

---

## Completion notes (2026-07-21)

**Verified against a production build and server, not just unit tests:**

- Post prerendered to `.next/server/app/blog/<slug>.html` with syntax highlighting intact.
- Next's tracer copies `content/` into `.next/standalone` — the plan's top risk did not
  materialise. This matters more than expected: the homepage is a dynamic route, so it
  reads posts at request time rather than build time, and would have failed without it.
- `/blog` 200, post 200, unknown slug 404, draft URL 404 in production.
- `sitemap.xml` lists published posts only; no draft or planned leakage.
- Post head carries title, description, canonical, OpenGraph article tags and valid
  `BlogPosting` JSON-LD.
- With only draft and planned content, `/blog` renders its empty state — a real production
  state today, since the one written post is still a draft.
- Frontend builds cleanly with the API stopped, so goal-attachment resolution degrades to a
  warning as designed.

**Deviations from plan:**

- **Shiki was a tenth dependency.** It is a required peer of `rehype-pretty-code` that pnpm
  does not install automatically.
- **E5 (nav tab) landed with C3** rather than at the end; it is two lines and belonged with
  the index it points at.
- **A dedicated `formatDate` helper** was added, not in the plan. `date-fns/parseISO` is
  needed because `new Date("2026-07-21")` parses as UTC and renders the previous day in
  negative-offset timezones.

**Bugs found and fixed during the work:**

- **YAML parses unquoted dates into `Date` objects**, not strings. Caught only because the
  loader tests read real files rather than hand-built objects. Frontmatter now normalises
  both forms to `YYYY-MM-DD`.
- **An XML comment in `api.csproj` contained `--`**, which is illegal, breaking every build.
  Committed unverified because the file was edited after the last test run.
- **`pnpm add` under pnpm 8 downgraded the lockfile** from v9 to v6 and dropped a native
  binding. Fixed by pinning `packageManager`.

**Still outstanding:**

1. **Manual browser review.** No browser tooling was available; every check was via curl and
   generated HTML. Layout, spacing and code-block contrast want a human eye.
2. **Real content.** The one written post is a draft, so production currently has zero
   published articles and `/blog` shows its empty state.
3. **`corepack enable`** has not been run — bare `pnpm` is still 8.2.0 on this machine, so
   the lockfile downgrade can recur outside corepack.
4. Deferred as specced: tag pages, RSS, per-post OG images, homepage post cap.
