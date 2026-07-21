using System.Net;
using System.Net.Http.Json;
using api.Tests.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;

namespace api.Tests.Integration;

/// <summary>
/// A thin smoke test over the real host: the wiring holds and slug reaches the wire.
/// Slug resolution itself is covered by the service and repository suites — this is
/// deliberately not a second copy of them.
/// </summary>
public class GoalsEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public GoalsEndpointTests(TestWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetGoals_WhenCalled_ReturnsOk()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/goals");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetGoals_ResponseShape_ExposesSlugOnEveryGoal()
    {
        var client = _factory.CreateClient();

        var page = await client.GetFromJsonAsync<PagedResponseDto<GoalResponseDto>>("/api/goals");

        Assert.NotNull(page);
        Assert.All(page.Payload, goal => Assert.NotNull(goal.Slug));
    }

    /// <summary>
    /// Goal creation is admin-only. A regression here would let anyone write to the
    /// public dashboard.
    /// </summary>
    [Fact]
    public async Task CreateGoal_Unauthenticated_IsRejected()
    {
        // Auto-redirect off: an unauthenticated request is challenged to Google, and a
        // following client would chase that absolute URL back into the test server and
        // get an unrelated 404. The first response is what matters here.
        var client = _factory.CreateClient(
            new WebApplicationFactoryClientOptions { AllowAutoRedirect = false }
        );

        var response = await client.PostAsJsonAsync(
            "/api/goals",
            new { name = "Sneaky goal", summary = "Should never be stored." }
        );

        Assert.False(
            response.IsSuccessStatusCode,
            $"Unauthenticated goal creation must be rejected, got {(int)response.StatusCode}."
        );

        var page = await client.GetFromJsonAsync<PagedResponseDto<GoalResponseDto>>("/api/goals");
        Assert.Empty(page!.Payload);
    }
}
