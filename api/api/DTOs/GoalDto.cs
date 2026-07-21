public class GoalRequestCreateDto
{
    public required string Name { get; set; }
    public required string Summary { get; set; }
    public string? Tags { get; set; }

    /// <summary>Optional. When omitted, the slug is derived from <see cref="Name"/>.</summary>
    public string? Slug { get; set; }
}

public class GoalResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;

    public List<TodoResponseDto> Todos { get; set; } = new List<TodoResponseDto>();
}
