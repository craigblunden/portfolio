using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Goals")]
public class Goal
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string Summary { get; set; }

    [Required]
    public required string Tags { get; set; }

    [Required]
    public List<Todo> Todos { get; set; } = new List<Todo>();
}
