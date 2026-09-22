/// <summary>
/// Normalises caller-supplied paging values before they reach a query.
///
/// Both list endpoints are anonymous, so <c>offset</c> and <c>limit</c> arrive
/// straight off the query string. Left unchecked, <c>?limit=0</c> divides by zero
/// while computing the page number and returns a 500, and a large limit turns one
/// request into an unbounded table scan. Clamping is preferred over rejecting with
/// a 400: these values drive a public list view, and quietly serving a sane page is
/// friendlier than an error for what is usually a hand-edited URL.
/// </summary>
public static class PageBounds
{
    public const int MaxLimit = 100;
    public const int DefaultLimit = 5;

    public static (int Offset, int Limit) Clamp(int offset, int limit)
    {
        var safeOffset = offset < 0 ? 0 : offset;
        var safeLimit = limit switch
        {
            < 1 => DefaultLimit,
            > MaxLimit => MaxLimit,
            _ => limit,
        };

        return (safeOffset, safeLimit);
    }
}
