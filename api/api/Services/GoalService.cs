public class GoalService : IGoalService
{
    private readonly IGoalRepository _goalRepository;

    public GoalService(IGoalRepository goalRepository)
    {
        _goalRepository = goalRepository;
    }

    async Task<PagedResponseDto<GoalResponseDto>> IGoalService.GetAllAsync(int offset, int limit)
    {
        var Goals = await _goalRepository.GetAllAsync(offset, limit);
        var totalCount = await _goalRepository.GetTotalCountAsync();
        var pageNumber = offset / limit + 1;
        var totalPages = (int)Math.Ceiling(totalCount / (double)limit);

        return new PagedResponseDto<GoalResponseDto>(
            Goals.Select(ToResponse),
            new PagedResponseMetaDto(totalPages, pageNumber < totalPages, pageNumber > 1)
        );
    }

    async Task<GoalResponseDto> IGoalService.CreateAsync(GoalRequestCreateDto dto)
    {
        var goal = new Goal
        {
            Name = dto.Name,
            Slug = await ResolveSlugAsync(dto),
            Summary = dto.Summary,
            Tags = dto.Tags ?? string.Empty,
        };
        await _goalRepository.AddAsync(goal);
        return ToResponse(goal);
    }

    async Task IGoalService.DeleteAsync(int id)
    {
        await _goalRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Determines the slug a new goal is stored with. Slugs are a public contract:
    /// blog frontmatter references them, and the database enforces uniqueness, so an
    /// invalid or duplicate value here surfaces as a failed insert.
    /// </summary>
    private Task<string> ResolveSlugAsync(GoalRequestCreateDto dto)
    {
        // A supplied slug is honoured only if it is already canonical. Normalising a
        // malformed one would silently reinterpret bad input; falling back to the name
        // gives a predictable result that can be corrected by hand afterwards.
        // Slugify is idempotent, so "unchanged by Slugify" is the validity check.
        var candidate =
            dto.Slug is not null && SlugGenerator.Slugify(dto.Slug) == dto.Slug
                ? dto.Slug
                : SlugGenerator.Slugify(dto.Name);

        return SlugGenerator.EnsureUniqueAsync(candidate, _goalRepository.SlugExistsAsync);
    }

    private static GoalResponseDto ToResponse(Goal Goal) =>
        new()
        {
            Id = Goal.Id,
            Name = Goal.Name,
            Slug = Goal.Slug,
            Summary = Goal.Summary,
            Todos = Goal
                .Todos.Select(t => new TodoResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Status = t.Status,
                    GoalId = t.GoalId,
                })
                .ToList(),
        };
}
