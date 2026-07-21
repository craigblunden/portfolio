This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Package manager

This project pins pnpm via the `packageManager` field. Use corepack so the pinned
version is used — a mismatched pnpm will rewrite `pnpm-lock.yaml` into an older
format and drop platform-specific optional dependencies, which breaks the build:

```bash
corepack enable          # once per machine
pnpm install
```

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
