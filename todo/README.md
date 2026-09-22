# Portfolio UI

Next.js 16 (App Router) front end for [craigblunden.dev](https://craigblunden.dev).
Architecture, deployment and the API setup live in the [root README](../README.md);
this file covers working in this package.

## Getting started

This project pins pnpm via the `packageManager` field. Use corepack so the pinned
version is used — a mismatched pnpm rewrites `pnpm-lock.yaml` into an older format
and drops platform-specific optional dependencies, which breaks the build:

```bash
corepack enable          # once per machine
pnpm install
pnpm dev                 # http://localhost:3000
```

| Command | |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm test` | Vitest (`pnpm test <file>` for one file) |

## Environment

Create `todo/.env.local`:

```sh
NEXT_PUBLIC_API_URL=http://localhost:5189/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is the absolute origin used for canonical URLs, OpenGraph
tags and the sitemap. It defaults to `http://localhost:3000`; set it to the real
domain in the deployment environment. The domain is not hardcoded anywhere, so
moving domains is an env change plus a rebuild.

## Layout

```
src/app/          App Router pages and the /api/* proxy route handlers
src/features/     feature modules — admin, auth, blog, dashboard, goals, resume, todos
src/components/   shared UI (shadcn/ui)
src/lib/          api-proxy, site config, utilities
content/blog/     blog posts as markdown
```

## Writing a blog post

Add a markdown file to `content/blog/`. The filename becomes the URL:
`my-post.md` is served at `/blog/my-post`, so it must be lowercase kebab-case.

```markdown
---
title: "A post title"
description: "Shown in search results and on the card. 200 characters max."
date: 2026-07-21
status: draft
tags: [dotnet, testing]
goals: [land-next-senior-role]
projects: [portfolio-dashboard]
---

Body markdown. GFM tables, task lists and syntax-highlighted code fences all work.
```

`status` controls visibility:

| status | `/blog` | own page | homepage | sitemap |
|---|---|---|---|---|
| `published` | yes | yes | yes | yes |
| `draft` | dev only | dev only | dev only | no |
| `planned` | no | never | yes, not clickable | no |

`goals` and `projects` are optional and attach the post to a goal or project, where
it shows as a "read more" link. Goal slugs come from the API; project slugs come
from `src/features/dashboard/data/projectsData.ts`. An unknown project slug fails
the build; an unknown goal slug only warns, since the API may be unreachable
during a build.

Invalid frontmatter fails the build with the filename and the offending field.

Posts are rendered at build time through remark/rehype **without**
`allowDangerousHtml`, so raw HTML in a post is dropped rather than emitted.
