using System.Text.RegularExpressions;
using api.Tests.Infrastructure;

namespace api.Tests.Services;

public class GoalServiceTests
{
    private const string SlugFormat = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

    private static IGoalService CreateService(FakeGoalRepository repository) =>
        new GoalService(repository);

    private static GoalRequestCreateDto NewGoal(string name, string? slug = null) =>
        new()
        {
            Name = name,
            Summary = "A goal for testing.",
            Slug = slug,
        };

    [Fact]
    public async Task CreateAsync_NoSlugSupplied_DerivesSlugFromName()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("Keep a steady reading habit"));

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("keep-a-steady-reading-habit", stored.Slug);
    }

    [Fact]
    public async Task CreateAsync_NameWithPunctuation_StoresSluggedForm()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("C# & .NET: deep dive!"));

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("c-net-deep-dive", stored.Slug);
    }

    [Fact]
    public async Task CreateAsync_SlugSupplied_UsesItInsteadOfTheName()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("Keep a steady reading habit", slug: "reading"));

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("reading", stored.Slug);
    }

    /// <summary>
    /// The database enforces the unique index, so a duplicate reaching it would throw.
    /// Two goals sharing a name is entirely plausible, and goal creation should not fail
    /// because of it.
    /// </summary>
    [Fact]
    public async Task CreateAsync_DerivedSlugAlreadyTaken_SuffixesRatherThanColliding()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("Keep a steady reading habit"));
        await service.CreateAsync(NewGoal("Keep a steady reading habit"));

        Assert.Equal(2, repository.Goals.Count);
        Assert.Equal("keep-a-steady-reading-habit", repository.Goals[0].Slug);
        Assert.Equal("keep-a-steady-reading-habit-2", repository.Goals[1].Slug);
    }

    [Fact]
    public async Task CreateAsync_SuppliedSlugAlreadyTaken_SuffixesRatherThanColliding()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("First goal", slug: "reading"));
        await service.CreateAsync(NewGoal("Second goal", slug: "reading"));

        Assert.Equal("reading", repository.Goals[0].Slug);
        Assert.Equal("reading-2", repository.Goals[1].Slug);
    }

    /// <summary>
    /// The supplied slug is untrusted input. Whatever the resolution strategy, a value
    /// that would break frontmatter references must never reach the database.
    /// </summary>
    [Theory]
    [InlineData("Not A Slug")]
    [InlineData("trailing spaces  ")]
    [InlineData("Punctuation!")]
    [InlineData("under_scores")]
    public async Task CreateAsync_MalformedSlugSupplied_StoresAValidSlug(string suppliedSlug)
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("Some goal", slug: suppliedSlug));

        var stored = Assert.Single(repository.Goals);
        Assert.Matches(SlugFormat, stored.Slug);
    }

    /// <summary>
    /// A malformed slug is discarded rather than normalised. Normalising would silently
    /// reinterpret bad input ("Not A Slug" becoming "not-a-slug"); falling back to the
    /// name is predictable and can be corrected by hand afterwards.
    /// </summary>
    [Fact]
    public async Task CreateAsync_MalformedSlugSupplied_FallsBackToNameRatherThanNormalising()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(NewGoal("Keep a steady reading habit", slug: "Not A Slug"));

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("keep-a-steady-reading-habit", stored.Slug);
    }

    [Fact]
    public async Task CreateAsync_WhenCalled_ReturnsSlugOnTheResponse()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        var response = await service.CreateAsync(NewGoal("Keep a steady reading habit"));

        Assert.Equal("keep-a-steady-reading-habit", response.Slug);
    }

    [Fact]
    public async Task GetAllAsync_WhenCalled_IncludesSlugOnEveryGoal()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);
        await service.CreateAsync(NewGoal("Land the next senior engineering role"));
        await service.CreateAsync(NewGoal("Keep a steady reading habit"));

        var page = await service.GetAllAsync(offset: 0, limit: 5);

        Assert.All(page.Payload, goal => Assert.Matches(SlugFormat, goal.Slug));
    }
}
