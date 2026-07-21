---
title: "EF Core migrations on SQLite are not symmetric"
description: "Applying a migration was atomic. Rolling it back wasn't. The difference only showed up because I checked instead of assuming."
date: 2026-07-21
status: draft
tags: [dotnet, sqlite, ef-core, migrations]
---

I added a `Slug` column with a unique index to a table today. Small change, two lines of
model code, one generated migration. I wrote in my own notes that the migration was
"atomic in both directions" and moved on.

That was wrong, and it took about thirty seconds to find out.

## What I assumed

The migration is unremarkable:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Slug",
        table: "Goals",
        nullable: false,
        defaultValue: "");

    migrationBuilder.CreateIndex(
        name: "IX_Goals_Slug",
        table: "Goals",
        column: "Slug",
        unique: true);
}
```

My reasoning went: SQLite wraps DDL in transactions, so if the unique index fails on
existing duplicate data, the whole thing rolls back cleanly. A safe failure. And since
`Down` is just the inverse, it must be equally safe.

The first half of that is true. The second half isn't.

## What actually happens

Rolling back printed a warning I hadn't seen before:

> ...cannot be executed in a transaction. If the app is terminated or an unrecoverable
> error occurs while this operation is being executed then the migration will be left in
> a partially applied state and would need to be reverted manually.

So I counted the warnings in each direction:

```sh
dotnet ef database update AddTodoStatus  # down: 2 warnings
dotnet ef database update                # up:   0 warnings
```

Applying is transactional. Rolling back is not.

The reason is that some SQLite schema changes can't be done in place — the provider has to
rebuild the table by creating a new one, copying rows across, dropping the original, and
renaming. That sequence can't be wrapped in a transaction, so EF Core tells you it's
running unprotected. Dropping a column that participates in an index is one of the cases
that takes this path.

## Why it matters

The practical consequences are worth being concrete about:

- **A failed rollback can leave a half-migrated schema.** Not corrupt data, but a database
  in a state no migration expects, needing manual repair.
- **Rollback is not a safety net.** I'd written "roll back if it fails" into my plan as the
  mitigation. It isn't one — the mitigation for a bad migration on SQLite is a *forward*
  fix: a new migration that corrects the problem.
- **The asymmetry is invisible unless you look.** Nothing in the generated migration hints
  at it. The warning only appears when you actually run the down path.

None of this is exotic. It's in the
[EF Core SQLite limitations docs](https://learn.microsoft.com/en-us/ef/core/providers/sqlite/limitations),
which I had not read closely enough, because the migration generated cleanly and applied
cleanly and I had no reason to think anything was unusual.

## The actual lesson

The lesson isn't about SQLite. It's that I wrote "rollback is the mitigation" in a planning
document without ever having run a rollback. It read like a fact. It was a guess wearing the
costume of a fact.

Testing the rollback path cost one command. Believing the guess would have cost me a
half-migrated production database at exactly the moment I was least equipped to deal with
it — mid-incident, with something already broken.

Cheap to check now. Expensive to discover later.
