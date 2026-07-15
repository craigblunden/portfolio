public class TodoRequestCreateDto
{
    public required string Title { get; set; }
    public int? GoalId { get; set; }
}

public class TodoRequestUpdateDto
{
    public string? Title { get; set; }
    public TodoStatus? Status { get; set; }
    public int? GoalId { get; set; }
}

public class TodoResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public TodoStatus Status { get; set; }
    public int? GoalId { get; set; }
}
