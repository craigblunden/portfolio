# Spec: Homepage Refocus & Shared Design System

## Objective

Refocus the portfolio homepage from a dense "build in public every day" dashboard into a
clean, easily digestible showcase of what Craig is doing right now, anchored by three
content pillars:

1. **The overall goal** — landing the next senior engineering role by November 2026.
2. **Projects I'm building** — what's being actively built and why it matters.
3. **Books I'm reading** — current reading with light context (what/why).

Goals with individual todos are **kept but demoted**: goals show rolled-up progress
(e.g. "6 of 10 done · due 25 Nov") with todos visible only on drill-in (existing
`GoalDrawer` pattern), never as a wall of task cards on the homepage.

Alongside the content refocus, formalize the **de facto design system** (the dark
terminal aesthetic already used by the dashboard and resume pages) into named tokens
that all pages consume, replacing both the stale VS Code-blue tokens in `globals.css`
and the hardcoded hex values scattered through components.

**User:** Recruiters, hiring managers, and engineers visiting the site — plus Craig
himself, who needs the page to stay motivating and honest even when progress is slow.

**Success looks like:** A visitor understands within 10 seconds who Craig is, what he's
looking for (senior role, November), and what he's actively doing (projects, reading,
goal progress) — without scrolling through granular todos.

## Tech Stack

- Next.js 16 (App Router, React 19, Server Components)
- Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css`)
- shadcn/ui components in `todo/src/components/ui`
- lucide-react icons, TanStack Query for API data
- Existing .NET backend API for todos/goals (proxied via `/api/backend`)

## Commands

```
Dev:        npm run dev          (in todo/)
Build:      npm run build        (in todo/)
Lint:       npm run lint         (in todo/)
Typecheck:  npm run typecheck    (in todo/)
Test:       npm run test         (in todo/, vitest)
```

## Project Structure

```
todo/src/app/globals.css                   → Design tokens (single source of truth)
todo/src/app/page.tsx                      → Homepage route (renders DashboardPage)
todo/src/features/dashboard/components/    → Homepage sections
todo/src/features/dashboard/data/          → Static content data (books, projects, fallbacks)
todo/src/features/resume/                  → Resume page (migrates to shared tokens)
todo/src/components/ui/                    → shadcn primitives (untouched)
```

## Design System

### Tokens (Phase A — foundation)

Replace the VS Code-blue values in `globals.css` `:root` / `@theme` with the palette
already in real use, so `bg-background`, `text-foreground`, `border-border`,
`text-primary` etc. resolve to the actual site aesthetic:

| Token                | Value     | Current hardcoded usage        |
|----------------------|-----------|--------------------------------|
| `--background`       | `#0a0d12` | page background                |
| `--card`             | `#0e1218` | card surfaces                  |
| `--secondary`        | `#151a22` | elevated / nested surfaces     |
| `--border`           | `#232b36` | all borders                    |
| `--primary`          | `#f0805c` | orange accent (CTAs, icons)    |
| `--foreground`       | `#e9eef5` | primary text                   |
| `--muted-foreground` | `#8b97a7` | secondary text                 |
| `--accent-green`     | `#57a773` | section labels, success        |
| `--success`          | `#4ec98a` | completed indicators           |
| faint text           | `#5d6878` / `#404a59` | de-emphasized meta |

Conventions carried over from the existing aesthetic: mono font for labels/badges,
`// section_label` uppercase-tracking headings, rounded-xl cards, subtle hover lift.

Typography floor (established previously on the resume page): body/readable content is
minimum 14px (`text-sm`); smaller sizes reserved for decorative labels, badges, meta.

### Consumption rule

New/edited components use semantic token classes (`bg-card`, `border-border`,
`text-primary`, `text-muted-foreground`) — no new hardcoded hex values. Existing pages
(resume) are migrated opportunistically, at minimum verified to look identical since
tokens now match the previously hardcoded values.

## Homepage Content & Layout (Phase B)

Top-to-bottom, single readable column rhythm (sections, not a grid maze):

1. **Hero** — portrait, "open to work" label, headline, short mission statement, and a
   compact countdown/target strip: "Target: senior engineering role · November 2026".
   Keep it tight; the current hero copy is close, layout simplified. The target strip
   replaces the `TimelineProgress` component; `SkillRadarCard` is removed from the
   homepage (component file retained for potential reuse elsewhere).
2. **The Goal (north star)** — one prominent card for the November job-search goal:
   rolled-up progress from its todos (computed done/total), due date, drill-in drawer
   for the todo detail. Other goals render smaller beneath/beside it.
3. **Projects I'm building** — cards from a static data module (name, one-line summary,
   status badge, stack tags, optional link). Content seeded from existing `projects`
   fixture, updated to reality.
4. **Books I'm reading** — new section: title, author, status (reading/finished/queued),
   optional one-liner on why. Static data module.
5. **Recently completed** — keep, capped at 2–4 items, as lightweight social proof of
   momentum. No habit grids, no commit feeds, no job-search board.

Removed entirely: commented-out sections (habits, blog posts, commits, side projects
board, job search board) are deleted from `DashboardPage.tsx`, with their data fixtures
pruned or repurposed. `SkillRadarCard` and `TimelineProgress` are removed from the
homepage. The admin search bar and "log progress" button header is also removed while
the daily-log workflow is paused; the `AdminSessionButton` remains accessible for
admin sign-in/out.

## Code Style

Follow existing feature-module conventions:

```tsx
// todo/src/features/dashboard/data/booksData.ts
export type Book = {
  title: string;
  author: string;
  status: "reading" | "finished" | "queued";
  note?: string;
};

export const books: Book[] = [
  {
    title: "...",
    author: "...",
    status: "reading",
    note: "Why it's on the list right now.",
  },
];
```

- Server components by default; client components only where interaction demands.
- Data lives in `features/*/data`, typed, exported as plain arrays/objects.
- Semantic Tailwind token classes, no new raw hex.

## Testing Strategy

- `npm run typecheck` and `npm run lint` must pass after every phase.
- Existing vitest suite (`npm run test`) must stay green.
- Visual verification of homepage and resume page in the browser after the token
  migration (tokens are chosen to be value-identical, so no visual regression expected).
- No new unit tests required for static content sections; goal progress roll-up logic
  (done/total computation) gets a unit test if extracted as a function.

## Boundaries

- **Always:** run typecheck + lint before finishing a phase; keep the mono/terminal
  aesthetic; keep admin functionality (session button, admin header) working.
- **Ask first:** changing backend API contracts; adding dependencies; altering the
  resume page beyond token migration; deleting the goals/todos drill-in entirely.
- **Never:** commit secrets; break the admin auth flow; introduce a second competing
  color system; regress body text below 14px.

## Success Criteria

- [ ] Homepage communicates identity + November goal + current projects + current books
      without any interaction, in a single scroll.
- [ ] No individual todos visible on the homepage by default (drawer drill-in only).
- [ ] Goal cards show real rolled-up progress (computed from todos), not hardcoded "60%".
- [ ] `globals.css` tokens match the live aesthetic; no VS Code-blue leftovers.
- [ ] New homepage sections contain zero hardcoded palette hex values.
- [ ] Resume page renders visually unchanged and consumes shared tokens.
- [ ] All commented-out dead sections removed from `DashboardPage.tsx`.
- [ ] Typecheck, lint, and existing tests pass.

## Layout Revision v2 (2026-07-21, after first implementation review)

The sectioned single-column layout didn't land. Revised direction:

- The homepage becomes a **three-column kanban-style board** — `goals_and_todos`,
  `projects`, `books` — inside explicit **VS Code chrome**: an editor tab strip at the
  top (`home.tsx` active, `resume.md` linking out), the board as the editor surface,
  and a VS Code-style status bar at the bottom (branch, diagnostics, target date,
  open-to-work). Columns stack vertically on mobile.
- Hero shrinks to a compact README-style strip above the board (small portrait,
  headline, one-liner, November target chip).
- The goals column shows the north-star goal card (computed progress) with its next
  todos inline as status rows; full todo detail stays in the drawer.
- The public "goals" nav link is removed; `/goals` remains as the admin working board
  (it carries the todo move/update mutations, which the read-focused homepage does not).

## Resolved Decisions (2026-07-21)

1. **Books data source** — static data file in the repo. ✅
2. **SkillRadarCard** — cut from the homepage. ✅
3. **TimelineProgress** — replaced by a simple target strip in the hero. ✅
4. **Admin search header + "log progress" button** — removed while daily logging is
   paused; admin session controls remain. ✅
