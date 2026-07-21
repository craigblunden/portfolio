using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Todo> Todos { get; set; }
    public DbSet<Goal> Goals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Blog frontmatter references goals by slug, so a duplicate would make the
        // reference ambiguous. Enforced in the database, not just in the service.
        modelBuilder.Entity<Goal>().HasIndex(g => g.Slug).IsUnique();
    }
}
