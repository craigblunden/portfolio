using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Todos")]
public class Todo
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string Title { get; set; }

    public bool IsCompleted { get; set; } = false;

    [ForeignKey("GoalId")]
    public int GoalId { get; set; }

    public Goal? Goal { get; set; }
}
