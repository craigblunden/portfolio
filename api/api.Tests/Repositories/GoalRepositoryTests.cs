using api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace api.Tests.Repositories;

/// <summary>
/// Runs against a real SQLite database so schema constraints actually apply.
/// xUnit creates one instance per test, so each test gets an isolated database.
/// </summary>
public class GoalRepositoryTests : IDisposable
{
    private readonly SqliteInMemoryDatabase _database = new();

    public void Dispose() => _database.Dispose();

    private static Goal NewGoal(string slug, string name = "A goal") =>
        new()
        {
            Name = name,
            Slug = slug,
            Summary = "A goal for testing.",
            Tags = string.Empty,
        };

    private async Task AddGoalAsync(Goal goal)
    {
        using var context = _database.CreateContext();
        await new GoalRepository(context).AddAsync(goal);
    }

    [Fact]
    public void Migrations_AppliedToAnEmptyDatabase_Succeed()
    {
        using var context = _database.CreateContext();

        // The fixture constructor migrates; reaching this point means it worked.
        Assert.Empty(context.Goals);
    }

    /// <summary>
    /// The reason this suite uses real SQLite. Blog frontmatter references goals by
    /// slug, so two goals sharing one would make the reference ambiguous.
    /// </summary>
    [Fact]
    public async Task AddAsync_SlugAlreadyUsed_ThrowsRatherThanStoringADuplicate()
    {
        await AddGoalAsync(NewGoal("reading-habit"));

        await Assert.ThrowsAsync<DbUpdateException>(() =>
            AddGoalAsync(NewGoal("reading-habit", name: "A different goal"))
        );
    }

    [Fact]
    public async Task AddAsync_DifferentSlugs_StoresBoth()
    {
        await AddGoalAsync(NewGoal("reading-habit"));
        await AddGoalAsync(NewGoal("senior-role"));

        using var context = _database.CreateContext();
        Assert.Equal(2, await context.Goals.CountAsync());
    }

    [Fact]
    public async Task SlugExistsAsync_SlugIsStored_ReturnsTrue()
    {
        await AddGoalAsync(NewGoal("reading-habit"));

        using var context = _database.CreateContext();
        Assert.True(await new GoalRepository(context).SlugExistsAsync("reading-habit"));
    }

    [Fact]
    public async Task SlugExistsAsync_SlugIsUnknown_ReturnsFalse()
    {
        await AddGoalAsync(NewGoal("reading-habit"));

        using var context = _database.CreateContext();
        Assert.False(await new GoalRepository(context).SlugExistsAsync("senior-role"));
    }

    [Fact]
    public async Task GetAllAsync_WithOffsetAndLimit_ReturnsTheRequestedWindow()
    {
        await AddGoalAsync(NewGoal("first", name: "First"));
        await AddGoalAsync(NewGoal("second", name: "Second"));
        await AddGoalAsync(NewGoal("third", name: "Third"));

        using var context = _database.CreateContext();
        var page = await new GoalRepository(context).GetAllAsync(offset: 1, limit: 1);

        var goal = Assert.Single(page);
        Assert.Equal("second", goal.Slug);
    }

    [Fact]
    public async Task GetAllAsync_GoalHasTodos_IncludesThem()
    {
        var goal = NewGoal("reading-habit");
        goal.Todos.Add(new Todo { Title = "Finish Staff Engineer", GoalId = goal.Id });
        await AddGoalAsync(goal);

        using var context = _database.CreateContext();
        var page = await new GoalRepository(context).GetAllAsync(offset: 0, limit: 5);

        var stored = Assert.Single(page);
        Assert.Single(stored.Todos);
    }
}
