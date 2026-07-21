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
            Slug = SlugGenerator.Slugify(dto.Name),
            Summary = dto.Summary,
            Tags = dto.Tags ?? string.Empty,
        };
        await _goalRepository.AddAsync(goal);
        return ToResponse(goal);
    }

    private static GoalResponseDto ToResponse(Goal Goal) =>
        new()
        {
            Id = Goal.Id,
            Name = Goal.Name,
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
