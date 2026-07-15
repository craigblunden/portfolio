using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum TodoStatus
{
    Backlog,
    InProgress,
    Blocked,
    Completed,
}

[Table("Todos")]
public class Todo
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string Title { get; set; }

    public TodoStatus Status { get; set; } = TodoStatus.Backlog;

    [ForeignKey("GoalId")]
    public int GoalId { get; set; }

    public Goal? Goal { get; set; }
}
