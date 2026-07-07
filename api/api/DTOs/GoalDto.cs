public class GoalResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;

    public List<TodoResponseDto> Todos { get; set; } = new List<TodoResponseDto>();
}
