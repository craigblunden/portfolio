# Implementation Plan: Homepage Refocus & Shared Design System

Spec: `tasks/spec-homepage-refocus.md`

## Overview

Promote the existing dark/orange terminal aesthetic into named design tokens in
`globals.css`, then rebuild the homepage as a clean top-to-bottom showcase: hero with a
November target strip, a north-star goal card with real computed progress, projects,
books, and a capped recently-completed strip. All dead/commented sections, the skill
radar, the timeline, and the admin search header are removed. The resume page migrates
to the shared tokens with no visual change.

## Architecture Decisions

- **Tokens first, value-identical.** New `:root`/`@theme` values in `globals.css` exactly
  match the hex already hardcoded across the site (`#0a0d12`, `#0e1218`, `#f0805c`, …),
  so token migration carries zero visual risk and can be verified by eye.
- **Semantic classes only in touched code.** Any component edited in this work switches
  to `bg-background` / `bg-card` / `border-border` / `text-primary` /
  `text-muted-foreground` etc. Untouched components keep their hex for now (no big-bang
  rewrite).
- **Goal progress is computed, not hardcoded.** A small pure function
  (`features/goals` scope) derives `{ done, total, percent }` from a goal's todos —
  unit-tested, shared by the goal cards and drawer.
- **Static content modules.** Books and projects are typed arrays in
  `features/dashboard/data/`, edited in the repo. No new API surface.
- **Dashboard stays a server component.** Interactive bits remain isolated
  (`GoalDrawer`, `AdminSessionButton`).

## Dependency Graph

```
Task 1: globals.css tokens
    ├── Task 2: resume page token migration        (independent of 3-7)
    └── Task 3: dashboard teardown (dead code out)
            ├── Task 4: hero + target strip
            ├── Task 5: goal progress rollup + north-star goal section
            ├── Task 6: projects section
            └── Task 7: books section
                    └── Task 8: recently completed cap + data pruning + polish
```

Tasks 4–7 are independent of each other once Task 3 lands (parallelizable).

## Task List

### Phase 1: Design System Foundation
- [ ] Task 1: Replace `globals.css` tokens with the live palette
- [ ] Task 2: Migrate resume page to semantic token classes

### Checkpoint: Foundation
- [ ] Typecheck + lint pass; homepage and resume look pixel-identical in browser

### Phase 2: Homepage Teardown & Hero
- [ ] Task 3: Tear down dead sections, admin header, radar, timeline
- [ ] Task 4: Simplified hero with November target strip

### Checkpoint: Teardown
- [ ] Homepage renders cleanly with hero + goals + recently completed only; admin
      sign-in still works

### Phase 3: Content Sections
- [ ] Task 5: Goal progress rollup + north-star goal section
- [ ] Task 6: Projects section
- [ ] Task 7: Books section
- [ ] Task 8: Recently completed cap, data pruning, final polish

### Checkpoint: Complete
- [ ] All spec success criteria met; typecheck, lint, vitest green; visual review done

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token rename collides with shadcn/ui component expectations (`bg-card`, `--primary` used by primitives) | Med | Tokens keep the same names shadcn expects, only values change; spot-check drawer, buttons, badges after Task 1 |
| Real goals API data shape doesn't match fixtures (todos missing on list response) | Med | Rollup function handles `todos: undefined` → shows count-less state; verify against live API in Task 5 |
| Removing admin header breaks a flow that depends on it | Low | Keep `AdminSessionButton` rendered elsewhere on the page; manually verify sign-in/out |
| Aggressive fixture pruning breaks other importers | Low | Grep for imports of each fixture before deleting |

## Open Questions

- Hero copy: keep "I'm tracking the next chapter." headline or revise? (Default: keep,
  tighten the paragraph. Flag during Task 4 review.)
- Actual books/projects content needs Craig's real list before launch — Task 6/7 seed
  with best-guess placeholders clearly marked for replacement.
