namespace api.Tests;

/// <summary>
/// Proves the test harness itself works: xUnit discovers tests in this project,
/// and the project reference to the API assembly resolves. If this fails, no
/// other test in the suite can be trusted.
/// </summary>
public class HarnessTests
{
    [Fact]
    public void TestProject_CanSeeTypesFromApiAssembly()
    {
        var goalType = typeof(Goal);

        Assert.Equal("Goal", goalType.Name);
    }
}
