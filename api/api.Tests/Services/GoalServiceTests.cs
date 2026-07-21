using api.Tests.Infrastructure;

namespace api.Tests.Services;

public class GoalServiceTests
{
    private static IGoalService CreateService(FakeGoalRepository repository) =>
        new GoalService(repository);

    [Fact]
    public async Task CreateAsync_NoSlugSupplied_DerivesSlugFromName()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(
            new GoalRequestCreateDto { Name = "Keep a steady reading habit", Summary = "One book at a time." }
        );

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("keep-a-steady-reading-habit", stored.Slug);
    }

    [Fact]
    public async Task CreateAsync_NameWithPunctuation_StoresSluggedForm()
    {
        var repository = new FakeGoalRepository();
        var service = CreateService(repository);

        await service.CreateAsync(
            new GoalRequestCreateDto { Name = "C# & .NET: deep dive!", Summary = "Going deeper." }
        );

        var stored = Assert.Single(repository.Goals);
        Assert.Equal("c-net-deep-dive", stored.Slug);
    }
}
