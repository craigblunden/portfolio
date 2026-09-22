namespace api.Tests.Services;

/// <summary>
/// The list endpoints are anonymous, so these values arrive straight off the query
/// string of a public URL. The bounds here are a availability control, not a
/// formatting nicety: before they existed, "?limit=0" returned a 500 from
/// production and a large limit read the whole table.
/// </summary>
public class PageBoundsTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(int.MinValue)]
    public void Clamp_LimitBelowOne_FallsBackToDefault(int limit)
    {
        var (_, safeLimit) = PageBounds.Clamp(0, limit);

        Assert.Equal(PageBounds.DefaultLimit, safeLimit);
    }

    /// <summary>A zero limit used to divide by zero while computing the page number.</summary>
    [Fact]
    public void Clamp_ZeroLimit_IsSafeAsADivisor()
    {
        var (safeOffset, safeLimit) = PageBounds.Clamp(0, 0);

        Assert.NotEqual(0, safeLimit);
        Assert.Equal(0, safeOffset / safeLimit);
    }

    [Theory]
    [InlineData(101)]
    [InlineData(99999)]
    [InlineData(int.MaxValue)]
    public void Clamp_LimitAboveMaximum_IsCappedAtMaximum(int limit)
    {
        var (_, safeLimit) = PageBounds.Clamp(0, limit);

        Assert.Equal(PageBounds.MaxLimit, safeLimit);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(int.MinValue)]
    public void Clamp_NegativeOffset_IsRaisedToZero(int offset)
    {
        var (safeOffset, _) = PageBounds.Clamp(offset, 5);

        Assert.Equal(0, safeOffset);
    }

    [Theory]
    [InlineData(0, 5)]
    [InlineData(10, 25)]
    [InlineData(0, PageBounds.MaxLimit)]
    public void Clamp_ValuesWithinBounds_ArePassedThroughUnchanged(int offset, int limit)
    {
        var (safeOffset, safeLimit) = PageBounds.Clamp(offset, limit);

        Assert.Equal(offset, safeOffset);
        Assert.Equal(limit, safeLimit);
    }
}
