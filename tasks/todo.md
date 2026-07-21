# Todo: Homepage Refocus & Shared Design System

Spec: `tasks/spec-homepage-refocus.md` · Plan: `tasks/plan.md`

> **Status (2026-07-21):** Tasks 1–8 implemented and committed (one commit per task,
> `cbcbb25..062886c`). Typecheck, lint, vitest, and production build all green.
> Outstanding: manual visual review in the browser (no browser tooling available to
> the agent), and replacing the clearly-marked placeholder content in
> `booksData.ts` / `projectsData.ts` with the real lists.

## Phase 1: Design System Foundation

## Task 1: Replace `globals.css` tokens with the live palette

**Description:** Swap the unused VS Code-blue token values in `:root`, `.dark`, and
`@theme` for the palette actually in use, keeping token *names* shadcn/ui expects.
Add missing semantic tokens (`--success`, `--accent-green`, faint text tiers). Remove
the stray global `h1`/`h2` margin rules if they conflict with page-level headings
(verify first).

**Acceptance criteria:**
- [ ] `--background: #0a0d12`, `--card: #0e1218`, `--secondary: #151a22`,
      `--border: #232b36`, `--primary: #f0805c`, `--foreground: #e9eef5`,
      `--muted-foreground: #8b97a7`, plus `--success: #4ec98a` and
      `--accent-green: #57a773` exposed as Tailwind color utilities
- [ ] No VS Code-blue values (`#0e639c`, `#1e1e1e`, `#007acc`, …) remain
- [ ] shadcn primitives (button, badge, card, drawer, input) still render correctly

**Verification:**
- [ ] `npm run typecheck && npm run lint`
- [ ] Manual: homepage, resume, goal drawer, admin sign-in page look unchanged/correct

**Dependencies:** None
**Files likely touched:** `todo/src/app/globals.css`
**Estimated scope:** S

---

## Task 2: Migrate resume page to semantic token classes

**Description:** Replace hardcoded hex classes in `ResumePage.tsx` with the new token
utilities (`bg-background`, `bg-card`, `border-border`, `text-primary`,
`text-muted-foreground`, `text-success`, …). Values are identical, so the page must
render pixel-identical.

**Acceptance criteria:**
- [ ] No raw palette hex values remain in `ResumePage.tsx`
- [ ] Page renders visually identical to before

**Verification:**
- [ ] `npm run typecheck && npm run lint`
- [ ] Manual: side-by-side visual check of `/resume`

**Dependencies:** Task 1
**Files likely touched:** `todo/src/features/resume/components/ResumePage.tsx`
**Estimated scope:** S

---

## Checkpoint: Foundation
- [ ] Typecheck, lint, vitest pass
- [ ] Homepage and resume visually unchanged

---

## Phase 2: Homepage Teardown & Hero

## Task 3: Tear down dead sections, admin header, radar, timeline

**Description:** Delete all commented-out sections from `DashboardPage.tsx` (habits,
blog posts, commits, side projects, job board). Remove the admin search/"log progress"
header while keeping `AdminSessionButton` rendered (relocated to a slim top-right
placement). Remove `SkillRadarCard` and `TimelineProgress` usage (leave component files
in place). Remove now-unused imports and the `boardColumns` remnant.

**Acceptance criteria:**
- [ ] `DashboardPage.tsx` contains no commented-out JSX sections
- [ ] Admin can still sign in/out via `AdminSessionButton`; visitors see no admin chrome
- [ ] Homepage renders hero + goals + recently completed without errors

**Verification:**
- [ ] `npm run typecheck && npm run lint && npm run test`
- [ ] Manual: load `/` as visitor and as admin

**Dependencies:** Task 1
**Files likely touched:** `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** S

---

## Task 4: Simplified hero with November target strip

**Description:** Rebuild the hero as a tight single block: portrait, "open to work"
label, headline, short mission paragraph (≥14px body), and a compact target strip —
"Target: senior engineering role · November 2026" — replacing `TimelineProgress`.
Use token classes throughout.

**Acceptance criteria:**
- [ ] Hero communicates identity + November target without scrolling
- [ ] Target strip present; no radar/timeline components rendered
- [ ] No new hardcoded palette hex; body text ≥ `text-sm`

**Verification:**
- [ ] `npm run typecheck && npm run lint`
- [ ] Manual: `/` at mobile and desktop widths

**Dependencies:** Task 3
**Files likely touched:** `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** S

---

## Checkpoint: Teardown
- [ ] Homepage clean (hero + goals + recently completed), admin flow verified

---

## Phase 3: Content Sections

## Task 5: Goal progress rollup + north-star goal section

**Description:** Add a pure `getGoalProgress(goal)` helper returning
`{ done, total, percent }` from a goal's todos (handles missing/empty todos). Render the
November job-search goal as one prominent north-star card (progress, due date, drawer
drill-in) with any other goals as smaller cards beneath. Replace hardcoded "60" and
"true / 10 / due 25-Nov" strings.

**Acceptance criteria:**
- [ ] Progress shown is computed from todos; no hardcoded percentages remain
- [ ] North-star goal visually dominant; other goals secondary
- [ ] Drawer drill-in still shows individual todos; none visible on the page by default

**Verification:**
- [ ] Unit test for `getGoalProgress` (empty, partial, complete, missing todos)
- [ ] `npm run typecheck && npm run lint && npm run test`
- [ ] Manual: check against live goals API and fallback fixtures

**Dependencies:** Task 3
**Files likely touched:**
- `todo/src/features/goals/lib/goalProgress.ts` (new)
- `todo/src/features/goals/lib/__tests__/goalProgress.test.ts` (new)
- `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** M

---

## Task 6: Projects section

**Description:** Add a typed `projectsData.ts` module (name, summary, status, stack,
optional link) seeded from the existing `projects` fixture updated to reality
(placeholders marked). Render a "projects_im_building" section of cards using token
classes and `DashboardSection`.

**Acceptance criteria:**
- [ ] Section renders project cards: name, one-liner, status badge, stack tags
- [ ] Data lives in `features/dashboard/data/projectsData.ts`, typed
- [ ] No hardcoded palette hex

**Verification:**
- [ ] `npm run typecheck && npm run lint`
- [ ] Manual: section legible at mobile and desktop widths

**Dependencies:** Task 3
**Files likely touched:**
- `todo/src/features/dashboard/data/projectsData.ts` (new)
- `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** S

---

## Task 7: Books section

**Description:** Add a typed `booksData.ts` module (`title`, `author`,
`status: "reading" | "finished" | "queued"`, optional `note`) with clearly-marked
placeholder entries. Render a "books_im_reading" section with status badges.

**Acceptance criteria:**
- [ ] Section renders books with title, author, status, optional note (≥14px body)
- [ ] Data lives in `features/dashboard/data/booksData.ts`, typed
- [ ] No hardcoded palette hex

**Verification:**
- [ ] `npm run typecheck && npm run lint`
- [ ] Manual: section legible at mobile and desktop widths

**Dependencies:** Task 3
**Files likely touched:**
- `todo/src/features/dashboard/data/booksData.ts` (new)
- `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** S

---

## Task 8: Recently completed cap, data pruning, final polish

**Description:** Cap "recently_completed" at 2–4 items. Prune `dashboardData.ts` of
fixtures with no remaining importers (`habits`, `blogPosts`, `commits`, old `projects`
— grep before deleting). Final pass: section order (hero → goal → projects → books →
completed), spacing rhythm, token-class consistency in all touched components.

**Acceptance criteria:**
- [ ] Homepage order matches spec; every section digestible without interaction
- [ ] No unused fixtures/imports remain in dashboard data or page
- [ ] All spec success criteria checked off

**Verification:**
- [ ] `npm run typecheck && npm run lint && npm run test`
- [ ] Manual: full-page review as visitor and admin, mobile and desktop

**Dependencies:** Tasks 4, 5, 6, 7
**Files likely touched:**
- `todo/src/features/dashboard/data/dashboardData.ts`
- `todo/src/features/dashboard/components/DashboardPage.tsx`
**Estimated scope:** S

---

## Checkpoint: Complete
- [ ] All spec success criteria met
- [ ] `npm run typecheck && npm run lint && npm run test` all green
- [ ] Visual review: `/`, `/resume`, goal drawer, admin sign-in
