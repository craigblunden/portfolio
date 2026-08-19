---
title: "Learning C# by building my portfolio in public"
description: "I started a throwaway CRUD app to learn C#. It turned into the portfolio site you're reading this on. Here's what the detour actually taught me."
date: 2026-07-16
status: published
tags: [engineering, dotnet, career]
---

After seven years at the same company, a gaming startup I joined as employee number seven and
watched get acquired by Sony along the way, I was made redundant while the company winds down. So I did the reasonable thing
and started a todo app. That todo app is the portfolio site you're reading this on.

Seven years deep, I knew Node, TypeScript and React cold, but nearly every job I wanted also
asked for C# and .NET, which I knew not at all. A CRUD app is the cheapest way to actually learn
a web framework, so I built one. (The redundancy gets [its own
post](/blog/redundancy-momentum-and-building-in-public); this is the engineering half.)

## A todo app was supposed to be the whole point

I picked a todo list on purpose. It's the "hello world" of CRUD, and CRUD is where you learn a
framework for real: routing, validation, persistence, the request lifecycle.

A few controllers in, I got bored of pretending anyone would use another todo app. A portfolio is
just todos with ambition, so I renamed the concept from _todos_ to _goals with deliverables_ and
kept going.

The bit I like most: the pivot cost no rewrite. The original `Todo` entity didn't get deleted, it
got demoted to a child of `Goal`.

```csharp
[Table("Goals")]
public class Goal
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Slug { get; set; }

    // The "deliverables" under a goal are the original todos, kept as a child collection.
    [Required]
    public List<Todo> Todos { get; set; } = new List<Todo>();
}
```

Every deliverable on a goal is, underneath, one of the original todos: the warmup became the data
model, which is just what happens when you let a small idea grow instead of restarting it.

## C# reads like TypeScript until it doesn't

My pitch to myself was that C# and TypeScript are close cousins: braces, generics,
`async`/`await`, interfaces, the same instincts. True enough to be dangerous. Then the
differences show up one at a time:

- **Nullable reference types and `required` members.** The compiler wants to know at compile time
  what can be null. It felt like nagging. It was catching real gaps before they became 500s.
- **EF Core is not Prisma.** "I know Prisma" got me maybe halfway. The rest was learning when a
  query actually hits the database.
- **The DI container is the framework,** not a library you bolt on. Wiring services into it in
  `Program.cs` is simply how the app is assembled.

I leaned on AI throughout, but as a tutor, not a ghostwriter: let it explain a concept, type the
models, controllers and xUnit tests myself. Generating the backend would have left me with a
working app and zero new skills. The friction was the point.

## Choosing the annoying options on purpose

For the same reason, I stacked the deck: **Azure** instead of AWS or Vercel, and **SQLite**
instead of managed Postgres, because I wanted the whole database in one file. The site runs as two
Azure Web Apps:

```text
craigblunden.dev
      │
      ▼
 Next.js (craigportfolioui)  ──/api proxy──▶  ASP.NET API (craigportfolio)
                                                     │ EF Core
                                                     ▼
                                              portfolio.db  (SQLite)
```

The frontend proxies `/api` through Next.js so the browser talks to one origin and cookies just
work. That part was easy. The file underneath was not.

## The deploy that ate my database

The connection string looked completely reasonable:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=portfolio.db"
}
```

And on boot the API applies pending migrations rather than recreating anything:

```csharp
await db.Database.MigrateAsync();
```

Locally, perfect. In production, every single deploy wiped the database, and it took me
embarrassingly long to see why.

`Data Source=portfolio.db` is a relative path, so the file lives next to the running app, and my
Azure deploy replaces that whole folder on every push. Each release went: new folder, no
`portfolio.db`, `MigrateAsync()` cheerfully creates a fresh empty one, every goal gone. Nothing
errored. The app came up perfectly healthy with total amnesia.

The fix: stop keeping the database inside the thing that gets replaced. Azure App Service gives
every app a persistent `%HOME%` area that survives deploys, so I pointed the default connection
string there:

```text
Data Source=D:\home\data\portfolio.db
```

I set it as an app setting rather than committing an absolute path. The trade-off, eyes open: one
file, no managed backups or failover. For a personal site with one writer behind an admin-only
login that's fine, and the data's easy to recreate for now. The day this goes multi-tenant is the
day it earns a managed database.

## What's next: the admin CMS

The more I use it, the more it wants to be the small back office for how I work in public. The
admin side lets only my email edit goals and deliverables, and every friction I hit becomes the
next thing I build. The backlog writes itself: it's just the list of things that annoyed me this
week.
