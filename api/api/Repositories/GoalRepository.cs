using Microsoft.EntityFrameworkCore;

public class GoalRepository : IGoalRepository
{
    private readonly AppDbContext _context;

    public GoalRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Goal>> GetAllAsync(int offset, int limit) =>
        await _context
            .Goals.AsNoTracking()
            .Include(g => g.Todos)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();

    public async Task AddAsync(Goal goal)
    {
        await _context.Goals.AddAsync(goal);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetTotalCountAsync() => await _context.Goals.CountAsync();

    public async Task<bool> SlugExistsAsync(string slug) =>
        await _context.Goals.AsNoTracking().AnyAsync(g => g.Slug == slug);

    public async Task DeleteAsync(int id)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null)
        {
            throw new EntityNotFoundException($"Goal with ID {id} was not found.");
        }

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
    }
}
